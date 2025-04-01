import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PodcastGenerationPipeline } from '../../libs/src/lib/podcast-generation-pipeline';
import { MockPodcastGenerationPipeline } from '../../libs/src/lib/mock-podcast-generation-pipeline';
import { DialogueGenerationOptions } from '../../libs/src/lib/models/dialogue.model';
import { PodcastDeliveryOptions } from '../../libs/src/lib/models/delivery.model';

// Main App component
const App = () => {
  // State for input content
  const [contentType, setContentType] = useState('url');
  const [contentInput, setContentInput] = useState('');
  const [file, setFile] = useState(null);
  
  // State for generation options
  const [speakerCount, setSpeakerCount] = useState(2);
  const [turnCount, setTurnCount] = useState(10);
  const [toneStyle, setToneStyle] = useState('educational');
  const [includeIntroduction, setIncludeIntroduction] = useState(true);
  const [includeConclusion, setIncludeConclusion] = useState(true);
  
  // State for delivery options
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeSpeakerLabels, setIncludeSpeakerLabels] = useState(true);
  const [includeChapters, setIncludeChapters] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  
  // State for pipeline status
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // State for mock mode
  const [useMockPipeline, setUseMockPipeline] = useState(false);
  
  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsGenerating(true);
      setCurrentStep('Initializing pipeline...');
      setProgress(0);
      setResult(null);
      setError(null);
      
      // Create output directory
      const outputDirectory = '/tmp/podcast-output';
      
      // Create pipeline (real or mock)
      const pipeline = useMockPipeline 
        ? new MockPodcastGenerationPipeline(outputDirectory)
        : new PodcastGenerationPipeline(outputDirectory);
      
      // Set dialogue options
      const dialogueOptions: DialogueGenerationOptions = {
        speakerCount,
        turnCount,
        toneStyle,
        includeIntroduction,
        includeConclusion
      };
      
      // Set delivery options
      const deliveryOptions: PodcastDeliveryOptions = {
        format: {
          id: audioFormat,
          name: audioFormat.toUpperCase(),
          extension: audioFormat,
          mimeType: `audio/${audioFormat}`,
          description: `Audio format: ${audioFormat}`
        },
        includeTranscript,
        includeSpeakerLabels,
        includeChapters,
        includeMetadata
      };
      
      // Process content based on type
      let podcastPackage;
      
      if (contentType === 'url') {
        setCurrentStep('Processing URL...');
        setProgress(10);
        podcastPackage = await pipeline.processUrl(contentInput, dialogueOptions, deliveryOptions);
      } else if (contentType === 'pdf' && file) {
        setCurrentStep('Processing PDF...');
        setProgress(10);
        podcastPackage = await pipeline.processPdf(file, dialogueOptions, deliveryOptions);
      } else if (contentType === 'video') {
        setCurrentStep('Processing video...');
        setProgress(10);
        podcastPackage = await pipeline.processVideo(contentInput, dialogueOptions, deliveryOptions);
      } else if (contentType === 'text') {
        setCurrentStep('Processing text...');
        setProgress(10);
        podcastPackage = await pipeline.processText(contentInput, dialogueOptions, deliveryOptions);
      } else {
        throw new Error('Invalid content type or missing input');
      }
      
      setResult(podcastPackage);
      setCurrentStep('Podcast generation complete!');
      setProgress(100);
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
      setCurrentStep('Error');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Podcast Generator MVP</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              {/* Content Input Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Content Input</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="contentType"
                        value="url"
                        checked={contentType === 'url'}
                        onChange={() => setContentType('url')}
                      />
                      <span className="ml-2">URL</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="contentType"
                        value="pdf"
                        checked={contentType === 'pdf'}
                        onChange={() => setContentType('pdf')}
                      />
                      <span className="ml-2">PDF</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="contentType"
                        value="video"
                        checked={contentType === 'video'}
                        onChange={() => setContentType('video')}
                      />
                      <span className="ml-2">Video</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="contentType"
                        value="text"
                        checked={contentType === 'text'}
                        onChange={() => setContentType('text')}
                      />
                      <span className="ml-2">Text</span>
                    </label>
                  </div>
                </div>
                
                {contentType === 'pdf' ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {contentType === 'url' ? 'URL' : contentType === 'video' ? 'Video URL' : 'Text Content'}
                    </label>
                    {contentType === 'text' ? (
                      <textarea
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        rows={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter text content here..."
                      />
                    ) : (
                      <input
                        type="text"
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder={contentType === 'url' ? 'https://example.com' : 'https://youtube.com/watch?v=...'}
                      />
                    )}
                  </div>
                )}
              </div>
              
              {/* Generation Options Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Generation Options</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Speakers</label>
                    <input
                      type="number"
                      min="2"
                      max="5"
                      value={speakerCount}
                      onChange={(e) => setSpeakerCount(parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Dialogue Turns</label>
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={turnCount}
                      onChange={(e) => setTurnCount(parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone Style</label>
                    <select
                      value={toneStyle}
                      onChange={(e) => setToneStyle(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="educational">Educational</option>
                      <option value="entertaining">Entertaining</option>
                      <option value="conversational">Conversational</option>
                      <option value="debate">Debate</option>
                      <option value="interview">Interview</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={includeIntroduction}
                        onChange={(e) => setIncludeIntroduction(e.target.checked)}
                      />
                      <span className="ml-2">Include Introduction</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={includeConclusion}
                        onChange={(e) => setIncludeConclusion(e.target.checked)}
                      />
                      <span className="ml-2">Include Conclusion</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Delivery Options Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Options</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Audio Format</label>
                    <select
                      value={audioFormat}
                      onChange={(e) => setAudioFormat(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                      <option value="ogg">OGG</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={includeTranscript}
                        onChange={(e) => setIncludeTranscript(e.target.checked)}
                      />
                      <span className="ml-2">Include Transcript</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={includeSpeakerLabels}
                        onChange={(e) => setIncludeSpeakerLabels(e.target.checked)}
                      />
                      <span className="ml-2">Include Speaker Labels</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={includeChapters}
                        onChange={(e) => setIncludeChapters(e.target.checked)}
                      />
                      <span className="ml-2">Include Chapters</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={includeMetadata}
                        onChange={(e) => setIncludeMetadata(e.target.checked)}
                      />
                      <span className="ml-2">Include Metadata</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Development Options */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Development Options</h2>
                
                <div className="flex items-center">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={useMockPipeline}
                      onChange={(e) => setUseMockPipeline(e.target.checked)}
                    />
                    <span className="ml-2">Use Mock Pipeline (no API calls)</span>
                  </label>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Podcast'}
                </button>
              </div>
            </form>
            
            {/* Progress Section */}
            {isGenerating && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Generation Progress</h2>
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-700">{currentStep}</div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Result Section */}
            {result && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Podcast</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-xl font-bold mb-2">{result.title}</h3>
                  <p className="text-gray-700 mb-4">{result.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Audio</h4>
                    <audio controls className="w-full">
                      <source src={result.audioUrl} type={`audio/${result.format}`} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                  
                  {result.transcriptUrl && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Transcript</h4>
                      <a 
                        href={result.transcriptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Download Transcript
                      </a>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span> {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <span className="font-medium">Format:</span> {result.format.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {Math.round(result.size / 1024 / 1024 * 100) / 100} MB
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(result.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Section */}
            {error && (
              <div className="mt-8">
                <div className="bg-red-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
