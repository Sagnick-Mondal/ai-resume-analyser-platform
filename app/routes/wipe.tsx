import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

// this route allows users to wipe all app data, including files and key-value storage
const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);

  // Clear any previous errors when the component mounts
  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    setFiles(files);
  };

  // Clear any previous errors when the component mounts
  useEffect(() => {
    loadFiles();
  }, []);

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  // Handle deletion of all files and key-value storage
  const handleDelete = async () => {
    for (const file of files) {
      await fs.delete(file.path);
    }
    await kv.flush();// Clear all key-value storage
    loadFiles();
  };

  // If loading or error, show appropriate message
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">
        Loading...
      </div>
    );
  }

  // If there's an error, display it
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        Error: {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl p-10 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-[#10A37F]">Wipe App Data</h1>
          <p className="text-gray-300">
            Authenticated as: <span className="font-semibold text-white">{auth.user?.username}</span>
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Existing Files</h2>
          {/* Display the list of files in the current directory */}
          {files.length > 0 ? (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-64 overflow-y-auto">
              <ul className="space-y-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex justify-between items-center text-gray-200 border-b border-white/10 pb-2 last:border-b-0"
                  >
                    <span>{file.name}</span>
                    <span className="text-xs text-gray-400">{file.path}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No files found.</p>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={handleDelete}
            className="w-full py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 transition text-white text-lg font-medium shadow-lg"
          >
            Wipe Everything
          </button>
        </div>
      </div>
    </main>
  );
};

export default WipeApp;
