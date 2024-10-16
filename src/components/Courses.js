import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCourses,
  createCourse,
  uploadFile,
  updateCourse,
  addMember,
  searchUsers,
  deleteCourse,
} from '../services/authService';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    emailFrequency: 'daily',
    numQuestions: 5,
  });
  const [file, setFile] = useState({});
  const [loading, setLoading] = useState(false);
  const [courseUpdates, setCourseUpdates] = useState({});
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false); // Track Add Member modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]); // Store search results  const [selectedCourseId, setSelectedCourseId] = useState(null); // Track selected course
  const [query, setQuery] = useState(''); // Store search input
  const [typingTimeout, setTypingTimeout] = useState(null); // Debounce timeout
  const [selectedCourseId, setSelectedCourseId] = useState(null); // Track selected course

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await getCourses();
        setCourses(courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  // Handle creating a new course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
  
    if (isSubmitting) return; // Prevent additional submissions
    setIsSubmitting(true);
    setLoading(true);
  
    try {
      const { data } = await createCourse(newCourse);
      setCourses([...courses, data.course]);
      alert('Course created successfully');
      setNewCourse({ name: '', emailFrequency: 'daily', numQuestions: 5 });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      alert('Course deleted successfully');
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course._id !== courseId)
      );
    } catch (error) {
      alert('Failed to delete course');
    }
  };

  const handleUpload = async (courseId) => {
    if (!file[courseId]) {
      alert('Please select a file to upload');
      return;
    }
    setLoading(true);
    try {
      await uploadFile(courseId, file[courseId]);
      alert('File uploaded successfully');
      setFile((prev) => ({ ...prev, [courseId]: null }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      if (typingTimeout) clearTimeout(typingTimeout); // Clear previous timeout

      const timeout = setTimeout(async () => {
        try {
          const data = await searchUsers(query); // Call search API
          setUsers(data); // Update users with search results
        } catch (error) {
          console.error('Error searching users:', error);
        }
      }, 300); // Set debounce time to 300ms

      setTypingTimeout(timeout); // Store the timeout
    } else {
      setUsers([]); // Clear results if query is empty
    }

    return () => clearTimeout(typingTimeout); // Cleanup timeout on unmount or query change
  }, [query]);

  const handleAddMember = async (username) => {
    if (!selectedCourseId) {
      alert('No course selected');
      return;
    }
    setLoading(true);
    try {
      await addMember(selectedCourseId, username);
      alert(`User ${username} added successfully to the course`);
      setQuery('');
      setUsers([]);
      setIsAddMemberModalOpen(false);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (courseId) => {
    setLoading(true);
    try {
      const updates = courseUpdates[courseId] || {};
      await updateCourse(courseId, updates);
      alert('Course updated successfully');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (courseId, e) => {
    const selectedFile = e.target.files[0];
    setFile((prev) => ({ ...prev, [courseId]: selectedFile }));
  };

  const handleUpdateChange = (courseId, e) => {
    const { name, value } = e.target;
    setCourseUpdates((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], [name]: value },
    }));
  };



  return (
    <div className="p-6">
      <button
  className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-800 z-50"
  onClick={() => setIsModalOpen(true)}
>
  +
</button>

      {isModalOpen && (
  <div
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
  >
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create a New Course</h2>
      <form onSubmit={handleCreateCourse}>
        <input
          type="text"
          placeholder="Course Name"
          value={newCourse.name}
          onChange={(e) =>
            setNewCourse({ ...newCourse, name: e.target.value })
          }
          required
          className="w-full p-2 mb-2 border rounded"
        />
        <select
          value={newCourse.emailFrequency}
          onChange={(e) =>
            setNewCourse({ ...newCourse, emailFrequency: e.target.value })
          }
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
        <input
          type="number"
          min="1"
          max="20"
          placeholder="Number of Questions"
          value={newCourse.numQuestions}
          onChange={(e) =>
            setNewCourse({
              ...newCourse,
              numQuestions: parseInt(e.target.value, 10),
            })
          }
          required
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-800"
        >
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  </div>
)}

{isAddMemberModalOpen && (
  <div
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
  >
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-2xl font-bold mb-4">Add Member</h2>
      <input
        type="text"
        placeholder="Search by username or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      {users.length > 0 ? (
        <ul className="mb-4 max-h-48 overflow-y-auto border rounded">
          {users.map((user) => (
            <li
              key={user._id}
              className="p-2 border-b cursor-pointer hover:bg-gray-200"
              onClick={() => handleAddMember(user.username)}
            >
              {user.username} ({user.email})
            </li>
          ))}
        </ul>
      ) : (
        query && <p>No users found</p>
      )}
      <button
        onClick={() => setIsAddMemberModalOpen(false)}
        className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-800"
      >
        Close
      </button>
    </div>
  </div>
)}


<h1 className="text-2xl font-bold mb-4">Your Courses</h1>
{courses.length > 0 ? (
  courses.map((course) => (
    <div
      key={course._id}
      className="p-4 mb-4 bg-white rounded-lg shadow-lg relative"
    >
      {/* Delete Button (X) in the Top-Left Corner */}
      <button
        onClick={() => handleDeleteCourse(course._id)}
        className="absolute top-2 left-2 text-red-600 hover:text-red-800 text-xl font-bold p-2"
        aria-label="Delete Course"
      >
        &times;
      </button>

      {/* Adding padding to avoid overlapping with the delete button */}
      <div className="pl-8">
        <h2 className="text-xl font-bold">{course.name}</h2>
        <p>Email Frequency: {course.emailFrequency}</p>
        <p>Number of Questions: {course.numQuestions}</p>
      </div>

      <input
        type="file"
        onChange={(e) => handleFileChange(course._id, e)}
        className="mt-2"
      />
      <button
        onClick={() => handleUpload(course._id)}
        disabled={loading}
        className="mt-2 p-2 bg-green-600 text-white rounded hover:bg-green-800"
      >
        {loading ? 'Uploading...' : 'Upload File'}
      </button>

      <h3 className="mt-4">Update Course</h3>
      <select
        name="emailFrequency"
        onChange={(e) => handleUpdateChange(course._id, e)}
        value={
          courseUpdates[course._id]?.emailFrequency || course.emailFrequency
        }
        className="w-full p-2 mb-2 border rounded"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <input
        type="number"
        name="numQuestions"
        min="1"
        max="20"
        placeholder="Number of Questions"
        onChange={(e) => handleUpdateChange(course._id, e)}
        value={
          courseUpdates[course._id]?.numQuestions || course.numQuestions
        }
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        onClick={() => handleUpdateCourse(course._id)}
        disabled={loading}
        className="p-2 bg-yellow-600 text-white rounded hover:bg-yellow-800"
      >
        {loading ? 'Updating...' : 'Update Course'}
      </button>

      <button
        onClick={() => {
          setSelectedCourseId(course._id);
          setIsAddMemberModalOpen(true);
        }}
        className="mt-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-800"
      >
        Add Members
      </button>

      <Link
        to={`/courses/${course._id}/previous-questions`}
        className="block mt-4 text-blue-600 hover:underline"
      >
        View Previous Questions
      </Link>
    </div>
  ))
) : (
  <p>No courses available. Create one to get started!</p>
)}

    </div>
  );
};

export default CoursesPage;
