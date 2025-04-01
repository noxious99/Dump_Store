import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosInstance from "../utils/axiosInstance";
import '../styles/qlEditor.css';
import { MdNoteAdd } from "react-icons/md";
import { FaRegWindowClose } from "react-icons/fa";

const NotesMain = () => {
  const [value, setValue] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState([]);
  const [showPopupNoteEditor, setShowPopupNoteEditor] = useState(false);
  const [maxNotes, setMaxNotes] = useState(false);
  const [error, setError] = useState(null);
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
      if (!value || !title) {
        setError('Please fill in all fields');
        return;
      }
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
      setError(error.message)
    } finally {
      setIsLoading(false);
      setShowPopupNoteEditor(false);
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
    const checkMaxNotes = () => {
      if (notes.length >= 6) {
        setMaxNotes(true);
      } else {
        setMaxNotes(false);
      }
    };
    checkMaxNotes();
  }, [notes.length]);

  return (
    <div className="w-full mb-10">

      <span disabled={maxNotes} onClick={() => !maxNotes && setShowPopupNoteEditor(true)}
      className=" flex w-[104px] h-[22px] lg:h-[28px] lg:w-[135px] items-center justify-center gap-1 mt-4 lg:mt-0 lg:gap-2 px-3 py-2 lg:px-4 lg:py-2
       bg-red-700 rounded bg-opacity-30 hover:bg-opacity-60 hover:ring-1 active:ring-1 ring-red-500">
        <MdNoteAdd className="text-xl lg:text-2xl" />
        <button disabled={maxNotes} className="text-xs lg:text-base"> Take Note </button>
      </span>
      <p className='text-[9px] lg:text-[12px] text-gray-400 italic'>* You can add up to 6 notes</p>
      {maxNotes && <p className='text-[9px] lg:text-[12px] text-red-500 italic'>You already have 6 notes in your list, delete one to add another</p>}
      <div className='w-[100%] h-[2px] bg-[#6B7274] my-2 lg:my-5'></div>
      <div className="flex flex-wrap gap-6 justify-start items-start">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-yellow-200 p-4 rounded shadow-md text-black min-w-[90%] min-h-[200px] lg:min-w-[250px] lg:max-w-[400px] items-start note-handwritten"
            >
              <p className="text-xl font-semibold mb-1">{note.title}</p>
              <p className="text-xs text-gray-700">{new Date(note.createdAt).toLocaleDateString('en-GB')}</p>
              <div className="h-[1px] bg-black mb-2"></div>
              <div
                className="min-h-[86%]"
                style={{
                  backgroundImage: `url('/images/text-pattern.svg')`,
                  backgroundSize: '90px 92px',
                  backgroundAttachment: 'local'
                }}
              >
                <div className="ql-editor p-2 text-base lg:text-lg overflow-visible" dangerouslySetInnerHTML={{ __html: note.content }} ></div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-100 p-4 rounded shadow-md flex items-center justify-center">
            <p>Loading notes...</p>
          </div>
        )}
      </div>

      {showPopupNoteEditor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-yellow-100 box-border mx-2 w-full max-w-lg p-4 rounded shadow-md">
            <div className="flex text-black justify-between items-center">
              <p className="text-lg font-semibold">Create Note</p>
              <FaRegWindowClose className="text-xl" onClick={() => setShowPopupNoteEditor(false)} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full box-border p-2 mb-2 border border-gray-300 rounded text-yellow-200 bg-black"
            />
            <div className="h-52 lg:h-60 mb-2 rounded-md overflow-hidden">
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
        </div>
      )}

    </div>
  );
};

export default NotesMain;
