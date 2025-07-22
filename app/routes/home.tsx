import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

// meta function to set the page title and description
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

// loader function to fetch data before rendering the page
export default function Home() {
  const { auth, kv } = usePuterStore();// Access the auth and kv store from the Puter store
  const navigate = useNavigate();// Use the useNavigate hook to programmatically navigate
  const [resumes, setResumes] = useState<Resume[]>([]);// Initialize resumes state to an empty array
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Check if the user is authenticated, if not redirect to auth page
  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  // Load resumes from the key-value store when the component mounts
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVItem[];// Fetch resumes from the key-value store

      // Parse the resumes from the key-value store
      const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value) as Resume
      ))
      // Set the parsed resumes to the state
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes()// Call the function to load resumes
  }, []);

  return <main className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 bg-cover">
    <Navbar />

    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your CV & Resume Ratings</h1>
        {!loadingResumes && resumes?.length === 0 ? (
            <h2 className="!text-gray-300">No resumes found. Upload your first resume to get started.</h2>
        ): (
          <h2 className="!text-gray-300">Review your submissions with AI-powered analyser.</h2>
        )}
      </div>
      {/* Show a loading spinner while resumes are being fetched */}
      {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
      )}
      {/* Map through the resumes and display them using ResumeCard component */}
      {!loadingResumes && resumes.length > 0 && (
        <div className="resumes-section !text-white">
          {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {/* If no resumes are found, show a button to upload a new resume */}
      {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
      )}
    </section>
  </main>
}
