using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

public class PodcastController : MonoBehaviour
{
    [Serializable]
    public class Character
    {
        public string name;
        public Animator animator;
        public AudioSource audioSource;

        [Header("VoiceRSS")]
        public string language = "en-us"; // hl
        public string voice = "Logan";    // v
    }

    public List<Character> characters;

    [TextArea(10, 30)]
    public string podcastScript;

    [Header("VoiceRSS")]
    public string voiceRssApiKey = "PUT_YOUR_API_KEY_HERE";

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

            // [Character - animation]
            if (line.StartsWith("[") && line.EndsWith("]"))
            {
                var content = line.Trim('[', ']');
                var parts = content.Split('-');

                string charName = parts[0].Trim();
                string anim = parts[1].Trim();

                if (!characterMap.ContainsKey(charName))
                    continue;

                currentSpeaker = characterMap[charName];

                currentSpeaker.animator.Play(anim);

                Debug.Log(currentSpeaker.name + " " + anim);

                currentTalkAnim = anim.StartsWith("talk") ? anim : null;
            }
            else
            {
                // Dialogue line
                if (currentSpeaker != null && currentTalkAnim != null)
                {
                    yield return StartCoroutine(PlayTTS(currentSpeaker, line));
                }
            }
        }
    }

    IEnumerator PlayTTS(Character character, string text)
    {
        string url =
            $"https://api.voicerss.org/?" +
            $"key={voiceRssApiKey}&" +
            $"hl={character.language}&" +
            $"v={character.voice}&" +
            $"src={UnityWebRequest.EscapeURL(text)}&" +
            $"c=MP3&" +
            $"f=44khz_16bit_stereo";

        using (UnityWebRequest www = UnityWebRequestMultimedia.GetAudioClip(url, AudioType.MPEG))
        {
            yield return www.SendWebRequest();

            if (www.result != UnityWebRequest.Result.Success)
            {
                Debug.LogError(www.error);
                yield break;
            }

            AudioClip clip = DownloadHandlerAudioClip.GetContent(www);
            character.audioSource.clip = clip;
            character.audioSource.Play();

            yield return new WaitWhile(() => character.audioSource.isPlaying);
        }
    }
}
