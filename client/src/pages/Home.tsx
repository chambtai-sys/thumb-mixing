import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Upload, Zap, Image as ImageIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const thumbnailsList = trpc.thumbnails.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const mixesList = trpc.mixes.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8 flex justify-center">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {APP_TITLE}
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Mix and blend YouTube thumbnails with AI-powered suggestions using Retrieval-Augmented Generation
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Upload className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Upload</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Upload multiple YouTube thumbnails for analysis
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Get intelligent mixing suggestions powered by RAG
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Blend</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Create optimized thumbnails with smart blending
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Upload and mix YouTube thumbnails with AI-powered suggestions
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="thumbnails">
              My Thumbnails ({thumbnailsList.data?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="mixes">
              My Mixes ({mixesList.data?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Thumbnails</CardTitle>
                <CardDescription>
                  Select one or more YouTube thumbnails to analyze and mix
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDragDrop}
                  className="border-2 border-dashed border-muted rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    Drag and drop your thumbnails here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <Button variant="outline" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">
                      Selected Files ({selectedFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4">
                      Upload & Analyze
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thumbnails" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Thumbnails</CardTitle>
                <CardDescription>
                  All uploaded thumbnails and their analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {thumbnailsList.isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : thumbnailsList.data?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No thumbnails uploaded yet. Start by uploading some!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {thumbnailsList.data?.map((item: any) => (
                      <Card key={item.thumbnails.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted">
                          <img
                            src={item.thumbnails.fileUrl}
                            alt={item.thumbnails.fileName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm font-semibold truncate">
                            {item.thumbnails.fileName}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() =>
                            navigate(
                                `/thumbnail/${item.thumbnails.id}`
                            )
                            }
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mixes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Mixes</CardTitle>
                <CardDescription>
                  Thumbnail combinations and blended results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mixesList.isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : mixesList.data?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No mixes created yet. Upload thumbnails and create your first mix!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {mixesList.data?.map((mix: any) => (
                      <Card key={mix.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{mix.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {mix.description}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/mix/${mix.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
