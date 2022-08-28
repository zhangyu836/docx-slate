import React from 'react';
import { cx, css } from '@emotion/css';

// Button element for all toolbar options
const Button = React.forwardRef(
	({ className, active, reversed, ...props }, ref) => (
		<span
			{...props}
			ref={ref}
			// emotion css to add custom style
			className={cx(
				className,
				css`
					cursor: pointer;
					color: ${reversed
						? active
							? 'white'
							: '#aaa'
						: active
						? '#344563'
						: '#ccc'};
				`
			)}
		/>
	)
);

export default Button;
