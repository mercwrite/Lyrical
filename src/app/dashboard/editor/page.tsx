"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Music,
  Save,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { SubscriptionCheck } from "@/components/subscription-check";

interface Song {
  id: string;
  title: string;
  lyrics: string;
  genre: string;
  mood: string;
  created_at: string;
  updated_at: string;
}

const genres = [
  "Pop",
  "Rock",
  "Hip-Hop",
  "Country",
  "Folk",
  "R&B",
  "Electronic",
  "Jazz",
  "Blues",
  "Alternative",
];
const moods = [
  "Happy",
  "Sad",
  "Energetic",
  "Romantic",
  "Melancholic",
  "Uplifting",
  "Dark",
  "Peaceful",
  "Angry",
  "Nostalgic",
];

export default function LyricEditor() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [lyrics, setLyrics] = useState("");
  const [title, setTitle] = useState("Untitled Song");
  const [genre, setGenre] = useState("Pop");
  const [mood, setMood] = useState("Happy");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [newSongDialogOpen, setNewSongDialogOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadSongs();
    }
  }, [user]);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }
    setUser(user);
  };

  const loadSongs = async () => {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading songs:", error);
      return;
    }

    setSongs(data || []);
    if (data && data.length > 0 && !currentSong) {
      selectSong(data[0]);
    }
  };

  const selectSong = (song: Song) => {
    setCurrentSong(song);
    setTitle(song.title);
    setLyrics(song.lyrics);
    setGenre(song.genre);
    setMood(song.mood);
  };

  const createNewSong = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("songs")
      .insert({
        user_id: user.id,
        title: "Untitled Song",
        lyrics: "",
        genre: "Pop",
        mood: "Happy",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating song:", error);
      setIsLoading(false);
      return;
    }

    await loadSongs();
    selectSong(data);
    setNewSongDialogOpen(false);
    setIsLoading(false);
  };

  const saveSong = async () => {
    if (!currentSong || !user) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("songs")
      .update({
        title,
        lyrics,
        genre,
        mood,
      })
      .eq("id", currentSong.id);

    if (error) {
      console.error("Error saving song:", error);
      setIsLoading(false);
      return;
    }

    await loadSongs();
    setIsLoading(false);
  };

  const deleteSong = async (songId: string) => {
    setIsLoading(true);
    const { error } = await supabase.from("songs").delete().eq("id", songId);

    if (error) {
      console.error("Error deleting song:", error);
      setIsLoading(false);
      return;
    }

    await loadSongs();
    if (currentSong?.id === songId) {
      setCurrentSong(null);
      setTitle("Untitled Song");
      setLyrics("");
      setGenre("Pop");
      setMood("Happy");
    }
    setIsLoading(false);
  };

  const generateAiSuggestion = () => {
    // Mock AI suggestion - in a real app, this would call an AI service
    const suggestions = [
      "Try adding a bridge that contrasts with your verse melody",
      "Consider using internal rhymes to add complexity",
      "This line could benefit from more concrete imagery",
      "The emotional arc could be strengthened in the chorus",
      "Try varying your syllable count for better rhythm",
    ];

    const randomSuggestion =
      suggestions[Math.floor(Math.random() * suggestions.length)];
    setAiSuggestion(randomSuggestion);
    setShowAiSuggestion(true);

    // Hide suggestion after 5 seconds
    setTimeout(() => {
      setShowAiSuggestion(false);
    }, 5000);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <SubscriptionCheck>
      <div className="min-h-screen bg-background">
        <DashboardNavbar />

        <ResizablePanelGroup
          direction="horizontal"
          className="h-[calc(100vh-73px)]"
        >
          {/* Sidebar */}
          <ResizablePanel
            defaultSize={sidebarCollapsed ? 5 : 25}
            minSize={5}
            maxSize={40}
            className="bg-muted/30"
          >
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h2 className="font-semibold flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    My Songs
                  </h2>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {!sidebarCollapsed && (
                <>
                  {/* New Song Button */}
                  <div className="p-4">
                    <Dialog
                      open={newSongDialogOpen}
                      onOpenChange={setNewSongDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          New Song
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Song</DialogTitle>
                          <DialogDescription>
                            Start writing a new song. You can always change the
                            title and settings later.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setNewSongDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={createNewSong} disabled={isLoading}>
                            {isLoading ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Create Song
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Songs List */}
                  <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {songs.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No songs yet</p>
                        <p className="text-sm">
                          Create your first song to get started
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {songs.map((song) => (
                          <Card
                            key={song.id}
                            className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                              currentSong?.id === song.id
                                ? "bg-accent border-primary"
                                : ""
                            }`}
                            onClick={() => selectSong(song)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium truncate">
                                    {song.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {song.genre} • {song.mood}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      song.updated_at,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Song
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &quot;
                                        {song.title}&quot;? This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteSong(song.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Editor */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full flex flex-col">
              {currentSong ? (
                <>
                  {/* Editor Header */}
                  <div className="p-6 border-b bg-background">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 max-w-md">
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
                          placeholder="Song title..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={generateAiSuggestion}
                          variant="outline"
                          size="sm"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Suggest
                        </Button>
                        <Button onClick={saveSong} disabled={isLoading}>
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Genre:</label>
                        <Select value={genre} onValueChange={setGenre}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Mood:</label>
                        <Select value={mood} onValueChange={setMood}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {moods.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion Banner */}
                  {showAiSuggestion && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-900">
                            AI Suggestion
                          </p>
                          <p className="text-sm text-purple-700">
                            {aiSuggestion}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAiSuggestion(false)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Lyrics Editor */}
                  <div className="flex-1 p-6">
                    <Textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="Start writing your lyrics here...\n\nVerse 1:\n\nChorus:\n\nVerse 2:\n\nBridge:"
                      className="h-full resize-none text-base leading-relaxed font-mono"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No song selected
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Select a song from the sidebar or create a new one to
                      start writing
                    </p>
                    <Button onClick={() => setNewSongDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Song
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SubscriptionCheck>
  );
}
