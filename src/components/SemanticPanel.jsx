function SemanticPanel({ semantic }) {
  console.log("Semantic data:", semantic);
  return (
    <section className="card">
      <h3>Semantic Analysis</h3>

      {Array.isArray(semantic) && semantic.length > 0 ? (
        <ul>
          {semantic.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No semantic analysis available.</p>
      )}

    </section>
  );
}


export default SemanticPanel;