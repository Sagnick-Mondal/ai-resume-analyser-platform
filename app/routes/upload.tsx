import { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

// This file is part of Puter, a personal AI assistant for your computer.
const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore(); // Ensure Puter is initialized
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false); //  Track processing state
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null); // Track selected file

  // Handle file selection from the FileUploader component
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  // Handle the resume analysis process
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);

    setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Error: Failed to upload file");

    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file)
      return setStatusText("Error: Failed to convert PDF to image");

    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Error: Failed to upload image");

    // Prepare data for analysis
    setStatusText("Preparing data...");
    const uuid = generateUUID();
    const data = {
      // Store resume data in key-value store
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data)); // Save resume data in key-value store

    setStatusText("Analyzing...");

    // Call AI service for feedback
    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!feedback) return setStatusText("Error: Failed to analyze resume");

    // Process feedback and update status
    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    // Update data with feedback
    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data)); // Update resume data with feedback
    setStatusText("Analysis complete, redirecting...");
    console.log(data);
    navigate(`/resume/${uuid}`); // Redirect to resume details page

    // Reset processing state
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault(); // Prevent default form submission
      const form = e.currentTarget.closest("form"); // Find the form element
      if (!form) return; // Ensure form is found
      const formData = new FormData(form);

      // Extract form data
      const companyName = formData.get("company-name") as string;
      const jobTitle = formData.get("job-title") as string;
      const jobDescription = formData.get("job-description") as string;

      if (!file) return;

      handleAnalyze({ companyName, jobTitle, jobDescription, file }); // Call analyze function with form data and selected file
    };

    return (
      <main className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 bg-cover">
        <Navbar />

        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Smart feedback for your dream job</h1>
            {/* Ensure Puter is initialized before rendering */}
            {isProcessing ? (
              <>
                <h2>{statusText}</h2>
                <img src="/images/resume-scan.gif" className="w-full" />
              </>
            ) : (
              <h2 className="!text-gray-300">
                Drop your resume for an ATS score and tips
              </h2>
            )}
            {/* Show status text if processing */}
            {!isProcessing && (
              <form
                id="upload-form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 mt-8"
              >
                <div className="form-div">
                  <label htmlFor="company-name" className="!text-gray-300">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company-name"
                    placeholder="Company Name"
                    id="company-name"
                    className="!bg-gray-300"
                  />
                </div>
                <div className="form-div">
                  <label htmlFor="job-title" className="!text-gray-300">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="job-title"
                    placeholder="Job Title"
                    id="job-title"
                    className="!bg-gray-300"
                  />
                </div>
                <div className="form-div">
                  <label htmlFor="job-description" className="!text-gray-300">
                    Job Description
                  </label>
                  <textarea
                    rows={5}
                    name="job-description"
                    placeholder="Job Description"
                    id="job-description"
                    className="!bg-gray-300"
                  />
                </div>

                <div className="form-div">
                  <label htmlFor="uploader" className="!text-gray-300">
                    Upload Resume
                  </label>
                  <FileUploader onFileSelect={handleFileSelect} />
                </div>

                <button className="primary-button font-semibold" type="submit">
                  Analyze Resume
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    );
  };
};
export default Upload;
