import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    { title: 'ResumePort | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])
// this is the resume review page, where users can view their resume and the feedback provided by the AI
const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();// using the puter store to access auth, fs, and kv
    const { id } = useParams();// getting the id from the URL params
    const [imageUrl, setImageUrl] = useState('');// state to hold the image URL of the resume
    const [resumeUrl, setResumeUrl] = useState('');// state to hold the resume URL
    const [feedback, setFeedback] = useState<Feedback | null>(null);// state to hold the feedback data
    const navigate = useNavigate();

    // check if the user is authenticated, if not redirect to auth page
    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    // load the resume and feedback data from the kv store using the id from the URL params
    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);// fetching the resume data from the kv store

            if(!resume) return;

            const data = JSON.parse(resume);// parsing the resume data

            const resumeBlob = await fs.read(data.resumePath);// reading the resume file from the filesystem
            if(!resumeBlob) return;

            // creating a blob URL for the resume PDF
            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);// creating a URL for the resume PDF
            setResumeUrl(resumeUrl);

            // creating a blob URL for the resume image
            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);// creating a URL for the resume image
            setImageUrl(imageUrl);

            // fetching the feedback data from the kv store
            setFeedback(data.feedback);// setting the feedback data to the state
            console.log({resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();// calling the function to load the resume and feedback data
    }, [id]);

    return (
        <main className="!pt-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <span className="text-gray-300 text-sm font-semibold">&larr; Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-gray-300 font-bold">Resume Review</h2>
                    {/* Show a loading spinner if the feedback is being loaded */}
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
