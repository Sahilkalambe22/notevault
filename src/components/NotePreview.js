// NotePreview.js
import "./NoteItem.css";

const NotePreview = ({ note }) => {
  return (
    <div className="note-card">
      <h2>{note.title}</h2>

      <div
        dangerouslySetInnerHTML={{ __html: note.description }}
      />

      {note.imagePath && (
        <img
          src={`http://localhost:5000${note.imagePath}`}
          alt=""
        />
      )}

      {note.attachments?.map((a, i) => (
        <a key={i} href={`http://localhost:5000${a.path}`}>
          {a.originalName}
        </a>
      ))}
    </div>
  );
};

export default NotePreview;