import "./SourceList.css";

const SourceList = ({ sources }) => {
  const formatDate = (isoString) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!sources || sources.length === 0) {
    return (
      <div className="source-list source-list--empty">
        <p>No sources available yet.</p>
      </div>
    );
  }

  return (
    <div className="source-list">
      <h4 className="source-list__title">Sources ({sources.length})</h4>
      <ul className="source-list__items">
        {sources.map((source, index) => (
          <li key={index} className="source-item">
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="source-item__link"
            >
              <div className="source-item__content">
                <span className="source-item__title">{source.title}</span>
                <div className="source-item__meta">
                  {source.source_name && (
                    <span className="source-item__publisher">{source.source_name}</span>
                  )}
                  {source.published_at && (
                    <span className="source-item__date">{formatDate(source.published_at)}</span>
                  )}
                </div>
              </div>
              <svg className="source-item__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourceList;
