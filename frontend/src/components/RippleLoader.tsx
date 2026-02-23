import React from 'react';

export const RippleLoader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <style>
                {`
                .uiverse-loader {
                    --cell-size: 52px;
                    --cell-spacing: 1px;
                    --cells: 3;
                    --total-size: calc(var(--cells) * (var(--cell-size) + 2 * var(--cell-spacing)));
                    display: flex;
                    flex-wrap: wrap;
                    width: var(--total-size);
                    height: var(--total-size);
                }

                .uiverse-cell {
                    flex: 0 0 var(--cell-size);
                    margin: var(--cell-spacing);
                    background-color: transparent;
                    box-sizing: border-box;
                    border-radius: 4px;
                    animation: 1.5s ripple ease infinite;
                }

                .uiverse-cell.d-1 { animation-delay: 100ms; }
                .uiverse-cell.d-2 { animation-delay: 200ms; }
                .uiverse-cell.d-3 { animation-delay: 300ms; }
                .uiverse-cell.d-4 { animation-delay: 400ms; }

                .uiverse-cell:nth-child(1) { --cell-color: #00FF87; }
                .uiverse-cell:nth-child(2) { --cell-color: #0BED8F; }
                .uiverse-cell:nth-child(3) { --cell-color: #16D996; }
                .uiverse-cell:nth-child(4) { --cell-color: #22C59E; }
                .uiverse-cell:nth-child(5) { --cell-color: #2DB1A6; }
                .uiverse-cell:nth-child(6) { --cell-color: #389EAD; }
                .uiverse-cell:nth-child(7) { --cell-color: #438AB5; }
                .uiverse-cell:nth-child(8) { --cell-color: #4E76BC; }
                .uiverse-cell:nth-child(9) { --cell-color: #5A62C4; }

                @keyframes ripple {
                    0% {
                        background-color: transparent;
                    }

                    30% {
                        background-color: var(--cell-color);
                        box-shadow: 0 0 var(--cell-size) var(--cell-color);
                    }

                    60% {
                        background-color: transparent;
                    }

                    100% {
                        background-color: transparent;
                    }
                }
                `}
            </style>
            <div className="uiverse-loader scale-50 md:scale-75">
                <div className="uiverse-cell d-0"></div>
                <div className="uiverse-cell d-1"></div>
                <div className="uiverse-cell d-2"></div>

                <div className="uiverse-cell d-1"></div>
                <div className="uiverse-cell d-2"></div>
                <div className="uiverse-cell d-3"></div>

                <div className="uiverse-cell d-2"></div>
                <div className="uiverse-cell d-3"></div>
                <div className="uiverse-cell d-4"></div>
            </div>
        </div>
    );
};
