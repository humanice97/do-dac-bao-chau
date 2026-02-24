import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Option {
    value: string
    label: string
}

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: Option[]
    icon?: React.ReactNode
    placeholder?: string
    disabled?: boolean
}

export default function CustomSelect({
    value,
    onChange,
    options,
    icon,
    placeholder = 'Chọn một tùy chọn',
    disabled = false
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        function handleScroll(e: Event) {
            // Prevent closing if the user is scrolling the dropdown itself
            if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return
            setIsOpen(false)
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            window.addEventListener('scroll', handleScroll, true) // capture phase mapping
            window.addEventListener('resize', () => setIsOpen(false))
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('scroll', handleScroll, true)
            window.removeEventListener('resize', () => setIsOpen(false))
        }
    }, [isOpen])

    const handleToggle = () => {
        if (disabled) return
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setMenuStyle({
                position: 'fixed',
                top: `${rect.bottom + 4}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                zIndex: 9999
            })
        }
        setIsOpen(!isOpen)
    }

    const selectedOption = options.find((opt) => opt.value === value)
    const displayLabel = selectedOption ? selectedOption.label : placeholder

    return (
        <div className="relative min-w-[200px]">
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={`w-full flex items-center justify-between text-left py-3 px-4 border rounded-lg transition-colors outline-none focus:ring-2 focus:ring-primary ${disabled
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : isOpen
                        ? 'border-primary ring-2 ring-primary/20 bg-white'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {icon && <span className={`flex-shrink-0 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>{icon}</span>}
                    <span className={`text-sm truncate ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{displayLabel}</span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ml-2 ${disabled ? 'text-gray-300' : 'text-gray-400'
                        } ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={dropdownRef}
                        style={menuStyle}
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="max-h-52 overflow-y-auto overscroll-contain w-full py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === option.value
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
