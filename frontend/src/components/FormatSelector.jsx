import "./FormatSelector.css";

// Inline SVG icons for better styling control
const WatchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="format-option__icon">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
);

const ListenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="format-option__icon">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
);

const ReadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="format-option__icon">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const FormatSelector = ({
    selectedFormat,
    onFormatChange,
    selectedDuration,
    onDurationChange,
    onGenerate,
    loading
}) => {
    const formats = [
        { id: "watch", label: "Watch", Icon: WatchIcon, description: "Video panel with character discussions" },
        { id: "listen", label: "Listen", Icon: ListenIcon, description: "Podcast-style audio narrative" },
        { id: "read", label: "Read", Icon: ReadIcon, description: "Long-form written article" },
    ];

    const durations = [5, 10, 15, 30];

    return (
        <div className="format-selector">
            <div className="format-options">
                {formats.map((format) => (
                    <button
                        key={format.id}
                        className={`format-option ${selectedFormat === format.id ? 'active' : ''}`}
                        onClick={() => onFormatChange(format.id)}
                    >
                        <format.Icon />
                        <span className="format-option__label">{format.label}</span>
                        <span className="format-option__desc">{format.description}</span>
                    </button>
                ))}
            </div>

            <div className="duration-selector">
                <span className="duration-label">Duration</span>
                <div className="duration-options">
                    {durations.map((duration) => (
                        <button
                            key={duration}
                            className={`duration-option ${selectedDuration === duration ? 'active' : ''}`}
                            onClick={() => onDurationChange(duration)}
                        >
                            {duration} min
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="generate-btn"
                onClick={onGenerate}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="btn-spinner"></span>
                        <span>Generating...</span>
                    </>
                ) : (
                    <>
                        <span>Generate Content</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </>
                )}
            </button>
        </div>
    );
};

export default FormatSelector;
