export default function LevelPanel({level, description}){
    return(
        <div className="panel">
            <div className="level-title">Level {level}</div>
            <div className="level-desc">{description}</div>
        </div>
    )
}