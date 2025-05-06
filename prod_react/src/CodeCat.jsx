import React, {useState} from 'react'


export default function CodeCat() {
    const [aiResponses, setAiResponses] = useState([]);
    const [hintCount, setHintCount] = useState(0)

const closeModal = () => {
    setShowModal(false);
    };

    const reopenModal = () => {
    setShowModal(true);
    };

const handleRunCompletion = async () => {
    try {
        const data = responses.join("\n");
        const aiMessage = await runCompletion(data);
        setAiResponses((prev) => [...prev, aiMessage.content]);
        setHintCount((prev) => prev + 1);
    } catch (error) {
        console.error("Error in runCompletion:", error);
    }
    };
    

return (
<div
style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#2E2F33",
    borderRadius: "8px",
    padding: "15px",
    overflow: "hidden",
}}
>
<h2 style={{ borderBottom: "2px solid #61dafb", paddingBottom: "10px" }}>
    AI Hints
</h2>
<div
    style={{
    flex: 1,
    overflowY: "auto",
    marginBottom: "10px",
    }}
>
    {aiResponses.map((response, index) => (
    <div
        key={index}
        style={{
        backgroundColor: "#3C3F41",
        borderRadius: "5px",
        marginBottom: "10px",
        padding: "10px",
        color: "#D1D1D1",
        }}
    >
        <strong>Hint {index + 1}:</strong>
        <p>{response}</p>
    </div>
    ))}
    {hintCount >= 4 && (
    <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
        You have used all your hints!
    </p>
    )}
</div>
<button
    onClick={handleRunCompletion}
    disabled={hintCount >= 4}
    style={{
    padding: "10px 20px",
    backgroundColor: hintCount >= 4 ? "#888" : "#61dafb",
    color: hintCount >= 4 ? "#555" : "#000",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: hintCount >= 4 ? "not-allowed" : "pointer",
    }}
>
    Get AI Help
</button>

<button
    onClick={reopenModal}
    style={{
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#61dafb",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    }}
>
    Show Instructions
</button>
</div> 

)
}
