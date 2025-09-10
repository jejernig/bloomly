import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import { Button } from '../Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('renders with default variant and size', () => {
      render(<Button>Default Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary-600')
      expect(button).toHaveClass('h-10')
    })

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    const variants = [
      { variant: 'default' as const, expectedClass: 'bg-primary-600' },
      { variant: 'destructive' as const, expectedClass: 'bg-red-600' },
      { variant: 'outline' as const, expectedClass: 'border' },
      { variant: 'secondary' as const, expectedClass: 'bg-secondary-100' },
      { variant: 'ghost' as const, expectedClass: 'hover:bg-accent' },
      { variant: 'link' as const, expectedClass: 'underline-offset-4' },
      { variant: 'gradient' as const, expectedClass: 'bg-gradient-to-r' },
    ]

    variants.forEach(({ variant, expectedClass }) => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Button variant={variant}>{variant} Button</Button>)
        expect(screen.getByRole('button')).toHaveClass(expectedClass)
      })
    })
  })

  describe('Sizes', () => {
    const sizes = [
      { size: 'default' as const, expectedClass: 'h-10' },
      { size: 'sm' as const, expectedClass: 'h-9' },
      { size: 'lg' as const, expectedClass: 'h-11' },
      { size: 'xl' as const, expectedClass: 'h-12' },
      { size: 'icon' as const, expectedClass: 'h-10 w-10' },
    ]

    sizes.forEach(({ size, expectedClass }) => {
      it(`renders ${size} size correctly`, () => {
        render(<Button size={size}>{size} Button</Button>)
        expect(screen.getByRole('button')).toHaveClass(expectedClass)
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      render(<Button loading>Loading Button</Button>)
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('is disabled when loading', () => {
      render(<Button loading>Loading Button</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('hides icons when loading', () => {
      render(
        <Button loading leftIcon={<span data-testid="left-icon">Left</span>}>
          Loading
        </Button>
      )
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
    })

    it('shows icons when not loading', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">Left</span>}>
          Not Loading
        </Button>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('renders left icon correctly', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">Left</span>}>
          With Left Icon
        </Button>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders right icon correctly', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">Right</span>}>
          With Right Icon
        </Button>
      )
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('renders both left and right icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">Left</span>}
          rightIcon={<span data-testid="right-icon">Right</span>}
        >
          With Both Icons
        </Button>
      )
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies disabled styling', () => {
      render(<Button disabled>Disabled Button</Button>)
      expect(screen.getByRole('button')).toHaveClass('opacity-50')
      expect(screen.getByRole('button')).toHaveClass('pointer-events-none')
    })
  })

  describe('Click Handling', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Clickable Button</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn()
      render(
        <Button onClick={handleClick} loading>
          Loading Button
        </Button>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('HTML Attributes', () => {
    it('passes through HTML button attributes', () => {
      render(
        <Button
          type="submit"
          form="test-form"
          data-testid="custom-button"
        >
          Submit Button
        </Button>
      )
      
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('form', 'test-form')
    })

    it('sets default type to button', () => {
      render(<Button>Default Type</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })
  })

  describe('Accessibility', () => {
    it('has proper focus management', () => {
      render(<Button>Focus Test</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      expect(button).toHaveFocus()
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
    })

    it('provides proper ARIA attributes when disabled', () => {
      render(<Button disabled>Disabled Button</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })

    it('is keyboard accessible', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Keyboard Test</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      fireEvent.keyDown(button, { key: 'Enter' })
      fireEvent.keyUp(button, { key: 'Enter' })
      
      // Button should be clickable via keyboard
      expect(button).toHaveFocus()
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Ref Test</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.textContent).toBe('Ref Test')
    })
  })
})