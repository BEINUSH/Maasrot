import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

interface AnimatedNumberProps {
  value: number;
  formatter?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, formatter, className = '' }: AnimatedNumberProps) {
  const animated = useAnimatedCounter(value);
  const text = formatter ? formatter(animated) : String(Math.round(animated));
  return (
    <span className={className} dir="ltr">
      {text}
    </span>
  );
}
