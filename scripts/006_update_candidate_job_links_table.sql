-- 006_update_candidate_job_links_table.sql
-- candidate_job_link テーブルのスキーマを最新仕様に対応させる

-- 1. 既存の assigned_ra_id カラムを廃止（未使用化）
ALTER TABLE candidate_job_links 
ADD COLUMN assigned_ra_id_deprecated INTEGER;

-- 既存データを移行
UPDATE candidate_job_links 
SET assigned_ra_id_deprecated = assigned_ra_id 
WHERE assigned_ra_id IS NOT NULL;

-- 元のカラムを削除
ALTER TABLE candidate_job_links 
DROP COLUMN assigned_ra_id;

-- 2. 新しいカラムを追加
ALTER TABLE candidate_job_links 
ADD COLUMN recommended_comment TEXT,
ADD COLUMN reviewed_by INTEGER,
ADD COLUMN recommended_at TIMESTAMP,
ADD COLUMN reviewed_at TIMESTAMP,
ADD COLUMN unlinked_at TIMESTAMP;

-- 3. 複合ユニーク制約を保証（既存の制約を確認・再作成）
-- 既存の制約を削除（存在する場合）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'candidate_job_links_candidate_id_job_id_key'
    ) THEN
        ALTER TABLE candidate_job_links 
        DROP CONSTRAINT candidate_job_links_candidate_id_job_id_key;
    END IF;
END $$;

-- 新しい複合ユニーク制約を作成
ALTER TABLE candidate_job_links 
ADD CONSTRAINT candidate_job_links_candidate_id_job_id_unique 
UNIQUE (candidate_id, job_id);

-- 4. status カラムの制約を更新（新しい状態を追加）
ALTER TABLE candidate_job_links 
DROP CONSTRAINT IF EXISTS candidate_job_links_status_check;

ALTER TABLE candidate_job_links 
ADD CONSTRAINT candidate_job_links_status_check 
CHECK (status IN ('linked', 'recommended', 'unlinked'));

-- 5. 監査ログテーブルを作成
CREATE TABLE IF NOT EXISTS link_audit (
    id SERIAL PRIMARY KEY,
    link_id INTEGER NOT NULL,
    actor_id INTEGER,
    action VARCHAR(50) NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meta JSONB,
    
    FOREIGN KEY (link_id) REFERENCES candidate_job_links(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 監査ログテーブルのインデックスを作成
CREATE INDEX idx_link_audit_link_id ON link_audit(link_id);
CREATE INDEX idx_link_audit_created_at ON link_audit(created_at);
CREATE INDEX idx_link_audit_action ON link_audit(action);

-- 6. 既存データの移行
-- 既存の linked_at データがある場合は status を 'linked' に設定
UPDATE candidate_job_links 
SET status = 'linked' 
WHERE status IS NULL AND linked_at IS NOT NULL;

-- 7. コメントを追加
COMMENT ON TABLE candidate_job_links IS '求職者と求人の紐付け管理テーブル';
COMMENT ON COLUMN candidate_job_links.status IS '紐付け状態: linked=引当済み, recommended=推薦済み, unlinked=解除済み';
COMMENT ON COLUMN candidate_job_links.recommended_comment IS '推薦時のコメント';
COMMENT ON COLUMN candidate_job_links.reviewed_by IS '推薦・解除を実行したRAのID（jobs.ra_idを参照）';
COMMENT ON COLUMN candidate_job_links.linked_at IS '引当日時';
COMMENT ON COLUMN candidate_job_links.recommended_at IS '推薦日時';
COMMENT ON COLUMN candidate_job_links.reviewed_at IS '最終更新日時';
COMMENT ON COLUMN candidate_job_links.unlinked_at IS '解除日時';
COMMENT ON COLUMN candidate_job_links.assigned_ra_id_deprecated IS '廃止されたカラム（後方互換性のため残置）';

COMMENT ON TABLE link_audit IS '求職者-求人紐付けの監査ログ';
COMMENT ON COLUMN link_audit.action IS '実行されたアクション: link, recommend, unlink';
COMMENT ON COLUMN link_audit.from_status IS '変更前の状態';
COMMENT ON COLUMN link_audit.to_status IS '変更後の状態';
COMMENT ON COLUMN link_audit.meta IS '追加情報（JSON形式）';

-- 8. トリガー関数を作成（監査ログ自動記録）
CREATE OR REPLACE FUNCTION log_link_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- 状態変更を監査ログに記録
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO link_audit (
            link_id, 
            actor_id, 
            action, 
            from_status, 
            to_status, 
            meta
        ) VALUES (
            NEW.id,
            NEW.reviewed_by,
            CASE 
                WHEN NEW.status = 'linked' THEN 'link'
                WHEN NEW.status = 'recommended' THEN 'recommend'
                WHEN NEW.status = 'unlinked' THEN 'unlink'
                ELSE 'update'
            END,
            OLD.status,
            NEW.status,
            jsonb_build_object(
                'candidate_id', NEW.candidate_id,
                'job_id', NEW.job_id,
                'comment', NEW.recommended_comment
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. トリガーを作成
DROP TRIGGER IF EXISTS trigger_log_link_changes ON candidate_job_links;

CREATE TRIGGER trigger_log_link_changes
    AFTER UPDATE ON candidate_job_links
    FOR EACH ROW
    EXECUTE FUNCTION log_link_changes();

-- 10. 挿入時のトリガーも作成
CREATE OR REPLACE FUNCTION log_link_inserts()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO link_audit (
        link_id, 
        actor_id, 
        action, 
        from_status, 
        to_status, 
        meta
    ) VALUES (
        NEW.id,
        NEW.reviewed_by,
        'link',
        NULL,
        NEW.status,
        jsonb_build_object(
            'candidate_id', NEW.candidate_id,
            'job_id', NEW.job_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_link_inserts ON candidate_job_links;

CREATE TRIGGER trigger_log_link_inserts
    AFTER INSERT ON candidate_job_links
    FOR EACH ROW
    EXECUTE FUNCTION log_link_inserts();

-- 11. サンプルデータの更新（既存データがある場合）
-- 既存のサンプルデータを新しいスキーマに合わせて更新
UPDATE candidate_job_links 
SET 
    status = 'linked',
    linked_at = COALESCE(linked_at, CURRENT_TIMESTAMP),
    reviewed_at = CURRENT_TIMESTAMP
WHERE status IS NULL;

-- 12. インデックスの最適化
CREATE INDEX IF NOT EXISTS idx_candidate_job_links_status ON candidate_job_links(status);
CREATE INDEX IF NOT EXISTS idx_candidate_job_links_reviewed_by ON candidate_job_links(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_candidate_job_links_linked_at ON candidate_job_links(linked_at);
CREATE INDEX IF NOT EXISTS idx_candidate_job_links_recommended_at ON candidate_job_links(recommended_at);




