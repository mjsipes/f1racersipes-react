import React from "react";

const GameStats = ({
  timeElapsed,
  WPM,
  numWordsTyped,
  percentComplete,
  isError,
}) => {
  return (
    <div className="game-stats-card">
      <div className="stats-header">
        <div className="stats-title">GAME STATS</div>
        <div className="timer-badge">{timeElapsed}s</div>
      </div>
      <div className="stats-main">
        <div className="stats-column">
          <div className="stats-label">WPM</div>
          <div className="stats-value">{WPM}</div>
        </div>
        <div className="vertical-divider"></div>
        <div className="stats-column">
          <div className="stats-label">Words</div>
          <div className="stats-value">{numWordsTyped}</div>
        </div>
      </div>
      <div className="stats-progress">
        <div className="progress-container">
          <div className="stats-label">Progress</div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
        </div>
        <div className="stats-column">
          {isError && <div className="error-message">Error detected!</div>}
        </div>
      </div>
    </div>
  );
};

export default GameStats;
