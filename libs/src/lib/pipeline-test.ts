import { PodcastGenerationPipeline } from './podcast-generation-pipeline';
import { DialogueGenerationOptions } from './models/dialogue.model';
import { PodcastDeliveryOptions } from './models/delivery.model';

/**
 * Test the podcast generation pipeline with a sample URL
 */
async function testPipelineWithUrl() {
  try {
    // Create output directory
    const outputDirectory = '/tmp/podcast-output';
    
    // Create pipeline
    const pipeline = new PodcastGenerationPipeline(outputDirectory);
    
    // Set dialogue options
    const dialogueOptions: DialogueGenerationOptions = {
      speakerCount: 2,
      turnCount: 10,
      toneStyle: 'educational',
      includeIntroduction: true,
      includeConclusion: true
    };
    
    // Set delivery options
    const deliveryOptions: PodcastDeliveryOptions = {
      format: {
        id: 'mp3',
        name: 'MP3',
        extension: 'mp3',
        mimeType: 'audio/mpeg',
        description: 'Standard audio format with good compression and wide compatibility'
      },
      includeTranscript: true,
      includeSpeakerLabels: true,
      includeChapters: true,
      includeMetadata: true
    };
    
    // Process a sample URL
    const sampleUrl = 'https://en.wikipedia.org/wiki/Podcast';
    console.log(`Testing pipeline with URL: ${sampleUrl}`);
    
    const result = await pipeline.processUrl(sampleUrl, dialogueOptions, deliveryOptions);
    
    console.log('Pipeline test completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Pipeline test failed:', error);
    throw error;
  }
}

/**
 * Test the podcast generation pipeline with sample text
 */
async function testPipelineWithText() {
  try {
    // Create output directory
    const outputDirectory = '/tmp/podcast-output';
    
    // Create pipeline
    const pipeline = new PodcastGenerationPipeline(outputDirectory);
    
    // Set dialogue options
    const dialogueOptions: DialogueGenerationOptions = {
      speakerCount: 3,
      turnCount: 15,
      toneStyle: 'entertaining',
      includeIntroduction: true,
      includeConclusion: true
    };
    
    // Set delivery options
    const deliveryOptions: PodcastDeliveryOptions = {
      format: {
        id: 'mp3',
        name: 'MP3',
        extension: 'mp3',
        mimeType: 'audio/mpeg',
        description: 'Standard audio format with good compression and wide compatibility'
      },
      includeTranscript: true,
      includeSpeakerLabels: true,
      includeChapters: true,
      includeMetadata: true
    };
    
    // Sample text to process
    const sampleText = `
    Podcasting is a form of audio broadcasting on the Internet. The audio files are stored as digital audio files, usually in MP3 format, and can be streamed online to a computer or mobile device or downloaded for listening offline. Podcasts are typically available as a series, with new installments that can be received by subscribers automatically.

    The term "podcast" was first suggested by The Guardian columnist and BBC journalist Ben Hammersley in February 2004 as a portmanteau of "iPod" (a brand of media player) and "broadcast". The success of the iPod at that time led to the usage of the term "podcast" to refer to these audio files, even though podcasts can be listened to on any device that can play audio files, not just iPods.

    Podcasting has become increasingly popular in recent years, with millions of people around the world listening to podcasts on a regular basis. Podcasts cover a wide range of topics, from news and politics to entertainment, education, and personal development. Many traditional media organizations, such as radio stations and newspapers, have also started producing podcasts as a way to reach new audiences.

    One of the key advantages of podcasting is its accessibility. Anyone with a microphone and an internet connection can create and distribute a podcast, making it a democratic medium that allows for a diverse range of voices and perspectives. This has led to the emergence of many niche podcasts that cater to specific interests and communities.

    Podcasting has also become a significant business, with many podcasters earning income through advertising, sponsorships, and listener donations. Some popular podcasts have millions of listeners and can command high advertising rates. The podcast industry has also seen significant investment from major technology and media companies, such as Spotify and Apple, which have developed dedicated podcast platforms and invested in exclusive content.
    `;
    
    console.log(`Testing pipeline with text input`);
    
    const result = await pipeline.processText(sampleText, dialogueOptions, deliveryOptions);
    
    console.log('Pipeline test completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Pipeline test failed:', error);
    throw error;
  }
}

// Export test functions
export { testPipelineWithUrl, testPipelineWithText };
