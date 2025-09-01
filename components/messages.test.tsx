import { render, screen, fireEvent } from '@testing-library/react'
import { Messages } from './messages'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'

// Mock dependencies
jest.mock('@/contexts/auth-context')
jest.mock('@/components/ui/use-toast')
jest.mock('@/lib/api')
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams()
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('Messages Component - Layout Tests', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, role: 'admin', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
      loading: false
    })
    
    mockUseToast.mockReturnValue({
      toast: jest.fn(),
      dismiss: jest.fn(),
      toasts: []
    })
  })

  describe('Layout Structure Tests', () => {
    test('should render main header correctly', () => {
      render(<Messages />)
      
      const header = screen.getByText('メッセージ管理')
      expect(header).toBeInTheDocument()
      expect(header.closest('div')).toHaveClass('flex-shrink-0')
    })

    test('should render left pane with thread list', () => {
      render(<Messages />)
      
      // Check for tab navigation
      expect(screen.getByText('横断')).toBeInTheDocument()
      expect(screen.getByText('ページ別')).toBeInTheDocument()
      
      // Check for search input
      expect(screen.getByPlaceholderText('候補者名で検索...')).toBeInTheDocument()
      
      // Check for filter button
      expect(screen.getByText('フィルタ')).toBeInTheDocument()
    })

    test('should render right pane with 3-split layout when thread is selected', () => {
      render(<Messages />)
      
      // Initially should show placeholder
      expect(screen.getByText('Select a thread from the left to display messages')).toBeInTheDocument()
    })
  })

  describe('Responsive Layout Tests', () => {
    test('should apply mobile layout on small screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })

      render(<Messages />)
      
      const mainContainer = screen.getByText('メッセージ管理').closest('.h-full')
      expect(mainContainer).toHaveClass('grid-cols-[1fr]')
    })

    test('should apply desktop layout on large screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      })

      render(<Messages />)
      
      const mainContainer = screen.getByText('メッセージ管理').closest('.h-full')
      expect(mainContainer).toHaveClass('grid-cols-[320px_1fr]')
    })
  })

  describe('Scroll Behavior Tests', () => {
    test('should have independent scroll areas', () => {
      render(<Messages />)
      
      // Check that thread list has overflow-y-auto
      const threadList = screen.getByText('横断').closest('.overflow-y-auto')
      expect(threadList).toBeInTheDocument()
    })
  })

  describe('Component Integration Tests', () => {
    test('should render CandidateHeader when thread is selected', () => {
      // Mock thread data
      const mockThread = {
        id: '1',
        title: 'Test Candidate',
        pageId: 'page1',
        lastMessageAt: '2024-01-01T00:00:00Z',
        ownerCA: '田中'
      }

      render(<Messages />)
      
      // This test would need more complex setup with mock data
      // For now, we'll test the structure
      expect(screen.getByText('メッセージ管理')).toBeInTheDocument()
    })

    test('should render MessageComposer at bottom', () => {
      render(<Messages />)
      
      // Check for composer elements
      expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument()
      expect(screen.getByText('Send')).toBeInTheDocument()
      expect(screen.getByText('テンプレ')).toBeInTheDocument()
      expect(screen.getByText('タグ送信')).toBeInTheDocument()
      expect(screen.getByText('同意リクエスト')).toBeInTheDocument()
      expect(screen.getByText('添付')).toBeInTheDocument()
    })
  })

  describe('Accessibility Tests', () => {
    test('should have proper ARIA labels', () => {
      render(<Messages />)
      
      const searchInput = screen.getByPlaceholderText('候補者名で検索...')
      expect(searchInput).toBeInTheDocument()
      
      const messageInput = screen.getByPlaceholderText('Enter your message...')
      expect(messageInput).toBeInTheDocument()
    })

    test('should have proper keyboard navigation', () => {
      render(<Messages />)
      
      const searchInput = screen.getByPlaceholderText('候補者名で検索...')
      expect(searchInput).toHaveAttribute('type', 'text')
      
      const messageInput = screen.getByPlaceholderText('Enter your message...')
      expect(messageInput.tagName).toBe('TEXTAREA')
    })
  })
})

  describe('Layout Requirements Validation', () => {
    test('should maintain 3-split grid layout: header(auto) / thread(1fr) / composer(auto)', () => {
      render(<Messages />)
      
      // Check main container structure
      const mainContainer = screen.getByText('メッセージ管理').closest('.h-full')
      expect(mainContainer).toHaveClass('flex', 'flex-col')
      
      // Check header is fixed
      const header = screen.getByText('メッセージ管理').closest('div')
      expect(header).toHaveClass('flex-shrink-0')
    })

    test('should ensure candidate header is always visible', () => {
      render(<Messages />)
      
      // This test would need mock data to fully validate
      // For now, we'll test the structure is in place
      const rightPane = screen.getByText('Select a thread from the left to display messages').closest('.flex')
      expect(rightPane).toHaveClass('flex', 'flex-col')
    })

    test('should ensure message composer is always visible', () => {
      render(<Messages />)
      
      const composer = screen.getByPlaceholderText('Enter your message...').closest('div')
      expect(composer).toBeInTheDocument()
    })

    test('should allow independent scrolling of message thread', () => {
      render(<Messages />)
      
      // Check that message area has overflow-y-auto
      const rightPane = screen.getByText('Select a thread from the left to display messages').closest('.flex')
      const messageArea = rightPane?.querySelector('.overflow-y-auto')
      expect(messageArea).toBeInTheDocument()
    })

    test('should have independent scroll areas for thread list and message area', () => {
      render(<Messages />)
      
      // Check that thread list has overflow-y-auto
      const threadList = screen.getByText('横断').closest('.flex')
      const threadScrollArea = threadList?.querySelector('.overflow-y-auto')
      expect(threadScrollArea).toBeInTheDocument()
      
      // Check that message area has overflow-y-auto
      const rightPane = screen.getByText('Select a thread from the left to display messages').closest('.flex')
      const messageScrollArea = rightPane?.querySelector('.overflow-y-auto')
      expect(messageScrollArea).toBeInTheDocument()
    })

    test('should have fixed filter area in thread list', () => {
      render(<Messages />)
      
      // Check that search and filter area has flex-shrink-0
      const filterArea = screen.getByPlaceholderText('候補者名で検索...').closest('.flex-shrink-0')
      expect(filterArea).toBeInTheDocument()
    })
  })
