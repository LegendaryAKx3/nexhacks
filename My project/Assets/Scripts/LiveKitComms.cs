//using System.Collections;
//using System.Collections.Concurrent;
//using System.Collections.Generic;
//using System.Text;
//using UnityEngine;
//using LiveKit; // For Room, AudioStream, ConnectionState
//using LiveKit.Proto; // For TrackKind

//public class LiveKitPodcastClient : MonoBehaviour
//{
//    [Header("Connection Settings")]
//    public string livekitUrl = "wss://my-project-1uigyrgp.livekit.cloud";
//    [TextArea] public string authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Njg3NTIyNDAsImlkZW50aXR5IjoicGFydGljaXBhbnQtMjgxMDQ5ZWI0OGIwIiwiaXNzIjoiQVBJVkdITFU1UThQUTQ3IiwibmFtZSI6InBhcnRpY2lwYW50LTI4MTA0OWViNDhiMCIsIm5iZiI6MTc2ODc1MTk0MCwic3ViIjoicGFydGljaXBhbnQtMjgxMDQ5ZWI0OGIwIiwidmlkZW8iOnsiY2FuVXBkYXRlT3duTWV0YWRhdGEiOnRydWUsInJvb20iOiJteS1yb29tIiwicm9vbUFkbWluIjp0cnVlLCJyb29tQ3JlYXRlIjp0cnVlLCJyb29tSm9pbiI6dHJ1ZSwicm9vbUxpc3QiOnRydWUsInJvb21SZWNvcmQiOnRydWV9fQ.KoWdXzyEuP-v3qqBkARqEOATA7YWwTLQVQHNlzP0ukE";

//    [Header("Audio")]
//    public AudioSource targetAudioSource;

//    private Room room;
//    private AudioStream audioStream;
//    private ConcurrentQueue<System.Action> mainThreadQueue = new ConcurrentQueue<System.Action>();

//    private IEnumerator Start()
//    {
//        if (targetAudioSource == null)
//        {
//            Debug.LogError("❌ Please assign an AudioSource in the Inspector.");
//            yield break;
//        }

//        // Setup Carrier Clip to keep Unity Audio Engine active
//        AudioClip carrier = AudioClip.Create("Carrier", 44100, 1, 44100, false);
//        carrier.SetData(new float[44100], 0);
//        targetAudioSource.clip = carrier;
//        targetAudioSource.loop = true;
//        targetAudioSource.Play();

//        room = new Room();
//        room.TrackSubscribed += OnTrackSubscribed;

//        // FIX 1: ConnectionStateChanged uses LiveKit.ConnectionState
//        room.ConnectionStateChanged += (state) => Debug.Log($"Connection: {state}");

//        Debug.Log($"Connecting to {livekitUrl}...");

//        // Use LiveKit.RoomOptions explicitly
//        var connectOp = room.Connect(livekitUrl, authToken, new LiveKit.RoomOptions());

//        if (connectOp.IsError)
//        {
//            Debug.LogError($"❌ Connection failed: {connectOp}");
//            yield break;
//        }
//        yield return connectOp;

//        // FIX 2: 'State' is named 'ConnectionState' in the Room class
//    }

//    private void Update()
//    {
//        while (mainThreadQueue.TryDequeue(out var action))
//        {
//            action.Invoke();
//        }
//    }

//    private void OnTrackSubscribed(IRemoteTrack track, RemoteTrackPublication pub, RemoteParticipant p)
//    {
//        // FIX 3: TrackKind is inside the LiveKit.Proto namespace
//        if (track.Kind != LiveKit.Proto.TrackKind.KindAudio) return;

//        mainThreadQueue.Enqueue(() =>
//        {
//            Debug.Log($"🔊 Audio track received from: {p.Identity}");

//            var audioTrack = track as RemoteAudioTrack;
//            if (audioTrack != null)
//            {
//                audioStream = new AudioStream(audioTrack, targetAudioSource);
//                if (!targetAudioSource.isPlaying) targetAudioSource.Play();
//            }
//        });
//    }

//    private void OnDestroy()
//    {
//        if (audioStream != null) audioStream.Dispose();
//        if (room != null) room.Disconnect();
//    }
//}