import React from "react";

type SmartIconProps<T extends React.ElementType> = React.ComponentProps<T> & {
	filled?: boolean;
	as: T; // the icon component to render
};

export function SmartIcon<T extends React.ElementType>({
	filled = false,
	as: Icon,
	style,
	...rest
}: SmartIconProps<T>) {
	return (
		<Icon
			{...(rest as any)}
			style={{
				...style,
				stroke: filled ? "none" : "currentColor",
				fill: filled ? "currentColor" : "none",
			}}
		/>
	);
}
