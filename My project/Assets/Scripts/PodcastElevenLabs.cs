using System;
using System.Collections;
using System.Collections.Generic;
using System.Text; // Required for JSON encoding
using UnityEngine;
using UnityEngine.Networking;

public class PodcastElevenLabs : MonoBehaviour
{
    [Serializable]
    public class Character
    {
        public string name;
        public Animator animator;
        public AudioSource audioSource;

        [Header("ElevenLabs Settings")]
        public string voiceId; // The unique ID for the ElevenLabs voice
    }

    public List<Character> characters;

    [TextArea(10, 30)]
    public string podcastScript;

    [Header("ElevenLabs Config")]
    public string elevenLabsApiKey = "PUT_YOUR_ELEVENLABS_API_KEY_HERE";
    public string modelId = "eleven_multilingual_v2"; // Default high-quality model

    private Dictionary<string, Character> characterMap;

    void Start()
    {
        characterMap = new Dictionary<string, Character>();
        foreach (var c in characters)
            characterMap[c.name] = c;

        StartCoroutine(RunPodcast());
    }

    IEnumerator RunPodcast()
    {
        var lines = podcastScript.Split('\n');

        Character currentSpeaker = null;
        string currentTalkAnim = null;

        foreach (var rawLine in lines)
        {
            var line = rawLine.Trim();
            if (string.IsNullOrEmpty(line)) continue;

            // Parsing: [Character - animation]
            if (line.StartsWith("[") && line.EndsWith("]"))
            {
                var content = line.Trim('[', ']');
                var parts = content.Split('-');

                if (parts.Length < 2) continue;

                string charName = parts[0].Trim();
                string anim = parts[1].Trim();

                if (!characterMap.ContainsKey(charName))
                    continue;

                currentSpeaker = characterMap[charName];
                currentSpeaker.animator.Play(anim);

                Debug.Log($"Speaker: {currentSpeaker.name} | Anim: {anim}");

                // Assuming talk animations start with "talk"
                currentTalkAnim = anim.ToLower().StartsWith("talk") ? anim : null;
            }
            else
            {
                // Dialogue line
                if (currentSpeaker != null && currentTalkAnim != null)
                {
                    yield return StartCoroutine(PlayElevenLabsTTS(currentSpeaker, line));
                }
            }
        }
    }

    IEnumerator PlayElevenLabsTTS(Character character, string text)
    {
        // ElevenLabs TTS URL
        string url = $"https://api.elevenlabs.io/v1/text-to-speech/{character.voiceId}";

        // Construct JSON body manually to avoid external dependencies
        // We escape quotes in the text to prevent breaking the JSON string
        string escapedText = text.Replace("\"", "\\\"");
        string jsonData = "{\"text\": \"" + escapedText + "\", \"model_id\": \"" + modelId + "\"}";
        byte[] postData = Encoding.UTF8.GetBytes(jsonData);

        using (UnityWebRequest www = new UnityWebRequest(url, "POST"))
        {
            www.uploadHandler = new UploadHandlerRaw(postData);
            www.downloadHandler = new DownloadHandlerAudioClip(url, AudioType.MPEG);

            // Set Headers
            www.SetRequestHeader("Content-Type", "application/json");
            www.SetRequestHeader("xi-api-key", elevenLabsApiKey);
            www.SetRequestHeader("accept", "audio/mpeg");

            yield return www.SendWebRequest();

            if (www.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError($"ElevenLabs Error: {www.error} - {www.downloadHandler.text}");
                yield break;
            }

            // Get the clip and play it
            AudioClip clip = DownloadHandlerAudioClip.GetContent(www);
            character.audioSource.clip = clip;
            character.audioSource.Play();

            // Wait until the character finishes speaking
            yield return new WaitWhile(() => character.audioSource.isPlaying);
        }
    }
}