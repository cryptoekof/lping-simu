import * as React from "react"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef(({ className, min = 0, max = 100, step = 1, value, onChange, ...props }, ref) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
      className={cn(
        "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Slider.displayName = "Slider"

export { Slider }
