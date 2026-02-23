import { useState } from "react";

export default function PaswdPanel({onSubmit}){
    const [password, setPassword] = useState("");

    return(
        <div className="panel">
            <div className="section-title">Password Attempt</div>

            <div className="row">
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                />
                <button onClick={() => onSubmit(password)}>Try</button>
            </div>
        </div>
    )
}