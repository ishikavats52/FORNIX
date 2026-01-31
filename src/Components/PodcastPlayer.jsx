import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

const PodcastPlayer = ({ podcast }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine if it's video or audio
    const isVideo = podcast.media_type === 'video';

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h4 className="text-white font-bold text-lg mb-1">{podcast.title}</h4>
                    {podcast.description && (
                        <p className="text-white/80 text-sm mb-2">{podcast.description}</p>
                    )}
                    {podcast.topics && podcast.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {podcast.topics.map((topic, idx) => (
                                <span key={idx} className="bg-white/20 text-white px-2 py-1 rounded text-xs">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold ml-3">
                    {isVideo ? '🎥 Video' : '🎵 Audio'}
                </span>
            </div>

            {/* Play/Expand Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
                {isExpanded ? (
                    <>
                        <span>▼</span> Hide Player
                    </>
                ) : (
                    <>
                        <span>▶</span> {isVideo ? 'Play Video' : 'Play Audio'}
                    </>
                )}
            </button>

            {/* Media Player */}
            {isExpanded && (
                <div className="mt-4">
                    {isVideo ? (
                        <video
                            controls
                            className="w-full rounded-lg"
                            src={podcast.media_url}
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <AudioPlayer audioUrl={podcast.media_url} />
                    )}
                </div>
            )}
        </div>
    );
};

export default PodcastPlayer;
