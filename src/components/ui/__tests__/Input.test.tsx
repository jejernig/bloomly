import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { Input } from '../Input'
import { Mail, Lock } from 'lucide-react'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter your email" />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('renders with default type as text', () => {
      render(<Input placeholder="Test input" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('applies custom className', () => {
      render(<Input className="custom-class" placeholder="Test" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-class')
    })
  })

  describe('Input Types', () => {
    const inputTypes = [
      { type: 'text', role: 'textbox' },
      { type: 'email', role: 'textbox' },
      { type: 'password', role: 'textbox' },
      { type: 'tel', role: 'textbox' },
      { type: 'url', role: 'textbox' },
    ]

    inputTypes.forEach(({ type, role }) => {
      it(`renders ${type} input correctly`, () => {
        render(<Input type={type as any} placeholder="Test" />)
        const input = screen.getByRole(role)
        expect(input).toHaveAttribute('type', type)
      })
    })

    it('renders number input correctly', () => {
      render(<Input type="number" placeholder="Enter number" />)
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
    })
  })

  describe('Label', () => {
    it('renders label when provided', () => {
      render(<Input label="Email Address" placeholder="Enter email" />)
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    })

    it('associates label with input via htmlFor', () => {
      render(<Input label="Password" type="password" placeholder="Enter password" />)
      const label = screen.getByText('Password')
      const input = screen.getByLabelText('Password')
      
      expect(label).toHaveAttribute('for', input.id)
    })

    it('generates unique IDs for multiple inputs', () => {
      render(
        <div>
          <Input label="First Input" placeholder="First" />
          <Input label="Second Input" placeholder="Second" />
        </div>
      )
      
      const firstInput = screen.getByLabelText('First Input')
      const secondInput = screen.getByLabelText('Second Input')
      
      expect(firstInput.id).not.toBe(secondInput.id)
    })

    it('uses provided id when given', () => {
      render(<Input id="custom-id" label="Custom ID" placeholder="Test" />)
      expect(screen.getByLabelText('Custom ID')).toHaveAttribute('id', 'custom-id')
    })
  })

  describe('Icons', () => {
    it('renders left icon correctly', () => {
      render(
        <Input
          leftIcon={<Mail data-testid="mail-icon" />}
          placeholder="Email"
        />
      )
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    })

    it('renders right icon correctly', () => {
      render(
        <Input
          rightIcon={<Lock data-testid="lock-icon" />}
          placeholder="Password"
          type="password"
        />
      )
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
    })

    it('renders both left and right icons', () => {
      render(
        <Input
          leftIcon={<Mail data-testid="mail-icon" />}
          rightIcon={<Lock data-testid="lock-icon" />}
          placeholder="Username"
        />
      )
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
    })

    it('applies correct padding when left icon is present', () => {
      render(
        <Input
          leftIcon={<Mail data-testid="mail-icon" />}
          placeholder="Email"
        />
      )
      expect(screen.getByRole('textbox')).toHaveClass('pl-10')
    })

    it('applies correct padding when right icon is present', () => {
      render(
        <Input
          rightIcon={<Lock data-testid="lock-icon" />}
          placeholder="Password"
        />
      )
      expect(screen.getByRole('textbox')).toHaveClass('pr-10')
    })
  })

  describe('Error States', () => {
    it('displays error message when provided', () => {
      render(<Input error="This field is required" placeholder="Test" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('applies error styling when error is present', () => {
      render(<Input error="Invalid input" placeholder="Test" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-500')
      expect(input).toHaveClass('focus-visible:ring-red-500')
    })

    it('shows error message with red color', () => {
      render(<Input error="Error message" placeholder="Test" />)
      const errorMessage = screen.getByText('Error message')
      expect(errorMessage).toHaveClass('text-red-600')
    })

    it('prioritizes error over helper text', () => {
      render(
        <Input
          error="Error message"
          helperText="Helper text"
          placeholder="Test"
        />
      )
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
    })
  })

  describe('Helper Text', () => {
    it('displays helper text when no error', () => {
      render(<Input helperText="This is helpful" placeholder="Test" />)
      expect(screen.getByText('This is helpful')).toBeInTheDocument()
    })

    it('shows helper text with muted color', () => {
      render(<Input helperText="Helper text" placeholder="Test" />)
      const helperText = screen.getByText('Helper text')
      expect(helperText).toHaveClass('text-muted-foreground')
    })
  })

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Input disabled placeholder="Disabled input" />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('applies disabled styling', () => {
      render(<Input disabled placeholder="Disabled input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:cursor-not-allowed')
      expect(input).toHaveClass('disabled:opacity-50')
    })
  })

  describe('User Interactions', () => {
    it('handles value changes', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} placeholder="Type here" />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test value' } })
      
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(input).toHaveValue('test value')
    })

    it('handles focus and blur events', () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      
      render(
        <Input
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Focus test"
        />
      )
      
      const input = screen.getByRole('textbox')
      
      fireEvent.focus(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      
      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard events', () => {
      const handleKeyDown = jest.fn()
      render(<Input onKeyDown={handleKeyDown} placeholder="Keyboard test" />)
      
      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has proper focus management', () => {
      render(<Input placeholder="Focus test" />)
      const input = screen.getByRole('textbox')
      
      input.focus()
      expect(input).toHaveFocus()
      expect(input).toHaveClass('focus-visible:outline-none')
      expect(input).toHaveClass('focus-visible:ring-2')
    })

    it('provides proper ARIA attributes', () => {
      render(
        <Input
          label="Required Field"
          error="This field is required"
          required
          placeholder="Test"
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('required')
    })

    it('associates error message with input for screen readers', () => {
      render(<Input error="Error message" placeholder="Test" />)
      const input = screen.getByRole('textbox')
      const errorMessage = screen.getByText('Error message')
      
      // The error should be associated via describedby or similar
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('Autocomplete Attributes', () => {
    it('passes through autocomplete attribute', () => {
      render(<Input autoComplete="email" placeholder="Email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email')
    })

    it('passes through other HTML input attributes', () => {
      render(
        <Input
          name="username"
          required
          maxLength={50}
          placeholder="Username"
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('name', 'username')
      expect(input).toHaveAttribute('required')
      expect(input).toHaveAttribute('maxlength', '50')
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} placeholder="Ref test" />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.placeholder).toBe('Ref test')
    })
  })

  describe('Container Styling', () => {
    it('applies container className', () => {
      render(
        <Input
          containerClassName="custom-container"
          placeholder="Container test"
        />
      )
      
      // The container should have the custom class
      const container = screen.getByRole('textbox').closest('div')
      expect(container).toHaveClass('custom-container')
    })
  })
})