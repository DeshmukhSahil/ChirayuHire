import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Linkedin, 
  Github, 
  Globe,
  Loader2,
  CheckCircle2,
  Save
} from "lucide-react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { toast } from "sonner";
import { db } from "@/src/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";

const normalizeUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export default function CandidateProfile() {
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeText, setResumeText] = useState("");
  const navigate = useNavigate();
  const { userData } = useAuth();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      
      if (file.type === "application/pdf") {
        // Send as base64
        const base64 = result.split(',')[1];
        handleSimulatedParse({ fileBase64: base64, fileType: file.type });
      } else {
        // Send as plain text
        setResumeText(result);
        toast.info("Text loaded from file. Click Analyze.");
      }
    };

    if (file.type === "application/pdf") {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleSimulatedParse = async (payloadOverride?: any) => {
    setParsing(true);
    try {
      const payload = payloadOverride || { resumeText };
      const response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResumeData(data);
      toast.success("AI Analysis complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to parse resume.");
    } finally {
      setParsing(false);
    }
  };

  const handleSaveCandidate = async () => {
    if (!resumeData) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "applications"), {
        name: resumeData.name || "Unknown Candidate",
        role: "Software Engineer", // Defaulting for now
        stage: "Applied",
        status: "applied",
        score: Math.floor(Math.random() * 20) + 80, // Random score for demo
        aiSummary: resumeData.candidateSummary || "Parsed via AI",
        orgId: userData?.orgId || "default-org",
        candidateId: "external-import",
        links: resumeData.links || null,
        appliedAt: new Date().toISOString(),
      });
      toast.success("Candidate added to pipeline!");
      navigate("/applications");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save candidate.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Candidate Profile</h2>
          <p className="text-muted-foreground">Import, parse, and enrich candidate data using AI.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2"><Linkedin className="h-4 w-4" /> Import LinkedIn</Button>
          <Button className="gap-2"><Github className="h-4 w-4" /> Github Sync</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Extraction */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" /> Resume Source
              </CardTitle>
              <CardDescription>Upload a PDF or paste plain text.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragActive ? 'border-primary bg-secondary' : 'border-muted'}`}
              >
                <input {...getInputProps()} />
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drag resume here</p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT</p>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or paste text</span></div>
              </div>

              <Textarea 
                placeholder="Paste resume content here..." 
                className="min-h-[200px]"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <Button 
                className="w-full gap-2" 
                onClick={handleSimulatedParse} 
                disabled={parsing || (!resumeText && !isDragActive)}
              >
                {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze with Gemini AI
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="md:col-span-8 space-y-6">
          {!resumeData && !parsing && (
            <div className="h-[500px] border rounded-lg flex flex-col items-center justify-center text-center p-8 bg-muted/30">
              <Brain className="h-12 w-12 text-muted mb-4" />
              <h3 className="text-lg font-semibold">No Data Extracted</h3>
              <p className="text-muted-foreground max-w-sm">Upload a resume on the left to see AI-powered extraction and scoring.</p>
            </div>
          )}

          {parsing && (
            <Card className="animate-pulse">
              <CardContent className="p-8 space-y-4">
                <div className="h-8 w-1/3 bg-secondary rounded" />
                <div className="h-4 w-full bg-secondary rounded" />
                <div className="h-20 w-full bg-secondary rounded" />
                <div className="flex gap-2">
                   <div className="h-6 w-16 bg-secondary rounded-full" />
                   <div className="h-6 w-16 bg-secondary rounded-full" />
                   <div className="h-6 w-16 bg-secondary rounded-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {resumeData && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleSaveCandidate} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Confirm & Add to Pipeline
                </Button>
              </div>
              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-2xl">{resumeData.name || "Candidate Name"}</CardTitle>
                    <CardDescription>{resumeData.email || "Email not found"}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black font-mono">92<span className="text-sm font-normal text-muted-foreground">/100</span></div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">ATS Score</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                       <Sparkles className="h-3 w-3 text-primary" /> AI Summary
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resumeData.candidateSummary || "Highly experienced developer with a background in large-scale systems."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills?.map((skill: string) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        )) || <span className="text-xs text-muted-foreground">No skills identified</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Links</h4>
                      <div className="flex gap-3">
                        {resumeData.links?.linkedin ? (
                          <a href={normalizeUrl(resumeData.links.linkedin)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100">
                              <Linkedin className="h-4 w-4" />
                            </Button>
                          </a>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/30 cursor-not-allowed" disabled>
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {resumeData.links?.github ? (
                          <a href={normalizeUrl(resumeData.links.github)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-800 hover:text-slate-900 hover:bg-slate-50 border-slate-200">
                              <Github className="h-4 w-4" />
                            </Button>
                          </a>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 cursor-not-allowed" disabled>
                            <Github className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {resumeData.links?.portfolio ? (
                          <a href={normalizeUrl(resumeData.links.portfolio)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-100">
                              <Globe className="h-4 w-4" />
                            </Button>
                          </a>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 cursor-not-allowed" disabled>
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                     <h4 className="text-sm font-semibold mb-3">Work Experience</h4>
                     <div className="space-y-4">
                        {resumeData.experience?.map((exp: any, i: number) => (
                          <div key={i} className="flex gap-4 items-start">
                             <div className="p-2 bg-secondary rounded-lg">
                               <CheckCircle2 className="h-4 w-4 text-primary" />
                             </div>
                             <div>
                               <p className="text-sm font-medium">{exp.company || exp.title || "Company"}</p>
                               <p className="text-xs text-muted-foreground">{exp.duration || exp.role || "Duration"}</p>
                             </div>
                          </div>
                        )) || <p className="text-xs text-muted-foreground italic">No details extracted</p>}
                     </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
