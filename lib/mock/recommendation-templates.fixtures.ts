export interface RecommendationTemplate {
  id: string;
  title: string;
  category: "職種別" | "企業別" | "汎用";
  body: string;
  description?: string;
}

export const MOCK_RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  {
    id: "template-1",
    title: "エンジニア職汎用テンプレート",
    category: "職種別",
    description: "フロントエンド・バックエンドエンジニア向けの汎用テンプレート",
    body: `拝啓

この度、貴社の求人に応募いたします候補者をご紹介させていただきます。

【候補者概要】
{{candidate_name}}様は、{{experience_years}}年の実務経験を持つ{{position}}です。
{{recent_work}}での経験を活かし、{{key_skills}}に精通しております。

【技術スキル】
{{technical_skills}}

【必須要件との適合性】
{{requirement_match}}

【CA所見】
{{ca_notes}}

【推薦理由】
{{recommendation_reason}}

ご検討いただけますと幸いです。
何卒よろしくお願いいたします。

敬具`
  },
  {
    id: "template-2",
    title: "フロントエンドエンジニア特化",
    category: "職種別",
    description: "React/TypeScript特化のフロントエンドエンジニア向け",
    body: `拝啓

この度、貴社のフロントエンドエンジニア求人に応募いたします候補者をご紹介させていただきます。

【候補者概要】
{{candidate_name}}様は、{{experience_years}}年のフロントエンド開発経験を持つエンジニアです。
{{recent_work}}でのReact/TypeScript開発を中心とした経験を活かし、{{key_skills}}に精通しております。

【技術スキル】
• フロントエンド: {{frontend_skills}}
• 開発ツール: {{dev_tools}}
• その他: {{other_skills}}

【必須要件との適合性】
{{requirement_match}}

【CA所見】
{{ca_notes}}

【推薦理由】
{{recommendation_reason}}

ご検討いただけますと幸いです。
何卒よろしくお願いいたします。

敬具`
  },
  {
    id: "template-3",
    title: "スタートアップ向け汎用",
    category: "企業別",
    description: "スタートアップ企業向けの汎用テンプレート",
    body: `拝啓

この度、貴社の求人に応募いたします候補者をご紹介させていただきます。

【候補者概要】
{{candidate_name}}様は、{{experience_years}}年の実務経験を持つ{{position}}です。
{{recent_work}}での経験を活かし、{{key_skills}}に精通しております。

【技術スキル】
{{technical_skills}}

【必須要件との適合性】
{{requirement_match}}

【CA所見】
{{ca_notes}}

【推薦理由】
{{recommendation_reason}}

スタートアップでの迅速な意思決定と実行力を重視する貴社の文化に、
{{candidate_name}}様の{{strength_points}}が大いに貢献できると考えております。

ご検討いただけますと幸いです。
何卒よろしくお願いいたします。

敬具`
  },
  {
    id: "template-4",
    title: "シンプル推薦文",
    category: "汎用",
    description: "シンプルで簡潔な推薦文テンプレート",
    body: `拝啓

この度、貴社の求人に応募いたします候補者をご紹介させていただきます。

【候補者概要】
{{candidate_name}}様は、{{experience_years}}年の実務経験を持つ{{position}}です。

【技術スキル】
{{technical_skills}}

【推薦理由】
{{recommendation_reason}}

ご検討いただけますと幸いです。
何卒よろしくお願いいたします。

敬具`
  }
];

export function getMockRecommendationTemplates(): RecommendationTemplate[] {
  return MOCK_RECOMMENDATION_TEMPLATES;
}

export function getMockRecommendationTemplate(id: string): RecommendationTemplate | null {
  return MOCK_RECOMMENDATION_TEMPLATES.find(template => template.id === id) || null;
}

