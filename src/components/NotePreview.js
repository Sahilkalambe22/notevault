// NotePreview.js
import "./NoteItem.css";


const host = "http://localhost:5000";
const NotePreview = ({ note }) => {
  return (
    <div className="">
      <h2>{note.title}</h2>

      <div
        dangerouslySetInnerHTML={{ __html: note.description }}
      />

      {note.imagePath && (
        <img
          src={`${host}${note.imagePath}`}
          alt=""
        />
      )}

      {note.attachments?.map((a, i) => (
        <a key={i} href={`${host}${a.path}`}>
          {a.originalName}
        </a>
      ))}
    </div>
  );
};

export default NotePreview;