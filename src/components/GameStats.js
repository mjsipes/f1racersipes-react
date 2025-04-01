import React from 'react';

const GameStats = ({ timeElapsed, CPM, numCharactersTyped, percentComplete, isError }) => {
  return (
    <div className="game-stats-card">
      <div className="stats-header">
        <div className="stats-title">GAME STATS</div>
        <div className="timer-badge">{timeElapsed}s</div>
      </div>
      <div className="stats-main">
        <div className="stats-column">
          <div className="stats-label">CPM</div>
          <div className="stats-value">{CPM}</div>
        </div>
        <div className="vertical-divider"></div>
        <div className="stats-column">
          <div className="stats-label">Characters</div>
          <div className="stats-value">{numCharactersTyped}</div>
        </div>
      </div>
      <div className="stats-progress">
        <div className="stats-column">
          <div className="stats-label">Accuracy</div>
          <div className="stats-value">{percentComplete}%</div>
        </div>
        <div className="progress-container">
          <div className="stats-label">Progress</div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
        </div>
      </div>
      {isError && <div className="error-message">Error detected!</div>}
    </div>
  );
};

export default GameStats;