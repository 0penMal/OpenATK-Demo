export default function LevelPanel({ level, description, totalLevels = 3, allCompleted = false }) {
  return (
    <div className="panel">
      <div className="level-header">
        <div className="level-title">{allCompleted ? "All levels completed" : `Level ${level}/${totalLevels}`}</div>
      </div>
      <div className="level-desc-block">
        <div className="level-desc-label">{allCompleted ? "Challenge Status" : "Level Description"}</div>
        <div className="level-desc-highlight">{description}</div>
      </div>
    </div>
  );
}
