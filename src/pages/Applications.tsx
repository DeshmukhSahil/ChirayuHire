import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";
import { 
  Filter, 
  Plus, 
  MoreHorizontal,
  Brain,
  MessageSquare,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/src/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/src/context/AuthContext";

const stages = ["Applied", "Screening", "Interview", "Technical Round", "HR Round", "Selected", "Rejected"];

export default function Applications() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    const orgId = userData?.orgId || "default-org";

    const q = query(
      collection(db, "applications"),
      where("orgId", "==", orgId)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCandidates(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore applications subscription failed:", error);
        setLoading(false); // Gracefully stop loading spinner even if query is denied
      }
    );

    return () => unsubscribe();
  }, [userData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Candidate Pipeline</h2>
          <p className="text-muted-foreground">Manage your recruitment funnel across all active job postings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Link to="/new-candidate">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Candidate
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
          {stages.map((stage) => (
            <div key={stage} className="flex-shrink-0 w-80 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-[10px]">
                  {stage}
                  <Badge variant="secondary" className="font-mono text-[10px] bg-background border">
                    {candidates.filter(c => c.stage === stage).length}
                  </Badge>
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3 kanban-column">
                {candidates
                  .filter((c) => c.stage === stage)
                  .map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      layoutId={candidate.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="cursor-pointer hover:border-primary transition-colors bg-card/50 shadow-sm border-muted">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border">
                                <AvatarFallback className="text-[10px]">{candidate.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold">{candidate.name}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">{candidate.role}</p>
                              </div>
                            </div>
                            {candidate.score > 85 && (
                               <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-100 flex gap-1 items-center font-mono text-[10px] px-1 h-5">
                                 <Brain className="h-3 w-3" /> {candidate.score}
                               </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
                            "{candidate.aiSummary}"
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-muted/50 text-[10px] text-muted-foreground">
                            <div className="flex gap-3">
                              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> 0</span>
                              <span className="flex items-center gap-1 font-medium"><FileText className="h-3 w-3" /> PDF</span>
                            </div>
                            <span className="font-medium">Recent</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
