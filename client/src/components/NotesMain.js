import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosInstance from "../utils/axiosInstance";
import '../styles/qlEditor.css';

const NotesMain = () => {
  const [value, setValue] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const modules = {
    toolbar: [
      ["italic", "underline", "strike"],
      [{ list: "ordered" }],
      ["link"],
      ["clean"],
    ]
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post('/api/note/create', {
        title: title,
        content: value,
        type: 'daily',
      });
      const updatedNoteList = [res.data, ...notes];
      setNotes(updatedNoteList);
      setValue('');
      setTitle('');
    } catch (error) {
      console.error('Error saving note:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axiosInstance.get('/api/note/dailynote');
        if (res.status === 200) {
          setNotes(res.data);
        }
        console.log('Fetched notes:', res.data);
      } catch (error) {
        console.error('Error fetching notes:', error.message);
      }
    };
    fetchNotes();
  }, []);

  return (
    <div className="mx-auto mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* Editor Card - First Element */}
        <div className="bg-yellow-100 w-[300px] p-4 rounded shadow-md lg:mr-10 lg:mb-5">
          <p className='text-black text-sm lg:text-md mb-1'>Create note</p>
          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-[94%] p-2 mb-2 border border-gray-300 rounded text-yellow-200 bg-black"
          />
          <div className="h-36 lg:h-60 mb-2 rounded-md overflow-hidden">
            <ReactQuill
              theme="snow"
              value={value}
              onChange={setValue}
              placeholder="Insert your idea/plan"
              style={{
                height: "100%",
                background: "black",
                borderRadius: "4px",
                color: "#FEF08A",
                overflowY: "auto",
              }}
              modules={modules}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-black text-gray-200 rounded px-4 py-2 hover:bg-[#7E2020] hover:text-black hover:scale-[1.02] transition-all"
          >
            {isLoading ? '...' : 'Save Note'}
          </button>
        </div>

        {notes.length > 0 ? (
          notes.map((note) => (
<div 
  key={note._id} 
  className="bg-yellow-200 p-4 rounded shadow-md text-black h-48 lg:h-64 items-start relative overflow-auto" 
  style={{
    backgroundImage: `url('/images/text-pattern.svg')`,
    backgroundSize: '100px 100px',
    backgroundAttachment: 'local'
  }}
>
  <p className="text-xl font-semibold mb-2">{note.title}</p>
  <div className="h-[1px] bg-black mb-2"></div>
  <div className="ql-editor" dangerouslySetInnerHTML={{ __html: note.content }}></div>
</div>
          ))
        ) : (
          <div className="bg-gray-100 p-4 rounded shadow-md flex items-center justify-center">
            <p>Loading notes...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesMain;
