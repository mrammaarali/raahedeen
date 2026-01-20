import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'dart:async';
import '../models/chapter.dart';

class AudioPlayerScreen extends StatefulWidget {
  final Chapter chapter;

  const AudioPlayerScreen({super.key, required this.chapter});

  @override
  State<AudioPlayerScreen> createState() => _AudioPlayerScreenState();
}

class _AudioPlayerScreenState extends State<AudioPlayerScreen> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  late StreamSubscription<PlayerState> _playerStateSubscription;

  @override
  void initState() {
    super.initState();
    _initAudioPlayer();
    _playerStateSubscription = _audioPlayer.playerStateStream.listen((state) {
      setState(() {}); // Rebuild UI on player state change
    });
  }

  Future<void> _initAudioPlayer() async {
    try {
      await _audioPlayer.setUrl(widget.chapter.audioUrl);
      _audioPlayer.play();
    } catch (e) {
      // Handle error
      print('Error loading audio source: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error loading audio. Please try again.')),
      );
    }
  }

  @override
  void dispose() {
    _playerStateSubscription.cancel();
    _audioPlayer.dispose();
    super.dispose();
  }

  String _formatDuration(Duration? duration) {
    if (duration == null) return '00:00';
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    return "$twoDigitMinutes:$twoDigitSeconds";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.chapter.title),
        backgroundColor: const Color(0xFF1F1F1F),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (widget.chapter.coverImageUrl != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  widget.chapter.coverImageUrl!,
                  height: 250,
                  width: 250,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stack) => const Icon(Icons.music_note, size: 150, color: Colors.grey),
                ),
              ),
            const SizedBox(height: 32),
            Text(
              widget.chapter.title,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              widget.chapter.description,
              style: TextStyle(fontSize: 16, color: Colors.grey[400]),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 32),
            StreamBuilder<Duration?>(
              stream: _audioPlayer.durationStream,
              builder: (context, snapshot) {
                final duration = snapshot.data ?? Duration.zero;
                return StreamBuilder<Duration>(
                  stream: _audioPlayer.positionStream,
                  builder: (context, snapshot) {
                    var position = snapshot.data ?? Duration.zero;
                    if (position > duration) {
                      position = duration;
                    }
                    return Column(
                      children: [
                        Slider(
                          min: 0.0,
                          max: duration.inSeconds.toDouble(),
                          value: position.inSeconds.toDouble(),
                          onChanged: (value) {
                            _audioPlayer.seek(Duration(seconds: value.round()));
                          },
                          activeColor: Theme.of(context).primaryColor,
                          inactiveColor: Colors.grey[700],
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(_formatDuration(position), style: const TextStyle(color: Colors.white70)),
                              Text(_formatDuration(duration), style: const TextStyle(color: Colors.white70)),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                );
              },
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.replay_10, color: Colors.white, size: 32),
                  onPressed: () => _audioPlayer.seek(Duration(seconds: _audioPlayer.position.inSeconds - 10)),
                ),
                const SizedBox(width: 20),
                IconButton(
                  icon: Icon(
                    _audioPlayer.playing ? Icons.pause_circle_filled : Icons.play_circle_filled,
                    color: Colors.white,
                    size: 64,
                  ),
                  onPressed: () {
                    if (_audioPlayer.playing) {
                      _audioPlayer.pause();
                    } else {
                      _audioPlayer.play();
                    }
                  },
                ),
                const SizedBox(width: 20),
                IconButton(
                  icon: const Icon(Icons.forward_10, color: Colors.white, size: 32),
                  onPressed: () => _audioPlayer.seek(Duration(seconds: _audioPlayer.position.inSeconds + 10)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
