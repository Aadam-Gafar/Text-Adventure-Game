using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;
using Ink.Runtime;
using System.Collections;
using System.Collections.Generic;
using System;

[Serializable]
public class StoryHistoryItem
{
    public string text;
    public bool isChoice;
}

[Serializable]
public class GameSaveData
{
    public string inkState;
    public List<StoryHistoryItem> history;
}

public class InkDialogueManager : MonoBehaviour
{
    [Header("Ink Story")]
    [SerializeField] private TextAsset inkJsonAsset;

    [Header("UI References")]
    [SerializeField] private GameObject contentPanel;
    [SerializeField] private ScrollRect scrollRect;
    [SerializeField] private GameObject storyTextPrefab;
    [SerializeField] private GameObject choiceButtonPrefab;
    [SerializeField] private Button menuButton;

    [Header("Settings")]
    [SerializeField] private float autoScrollSpeed = 0.3f;

    private Story story;
    private List<GameObject> currentChoiceButtons = new List<GameObject>();
    private List<StoryHistoryItem> storyHistory = new List<StoryHistoryItem>();
    private const string SAVE_KEY = "InkGameSave";
    private bool isLoadingGame = false;

    void Start()
    {
        // Wire up menu button
        if (menuButton != null)
        {
            menuButton.onClick.AddListener(OnMenuButtonClicked);
        }

        // Initialize the story
        story = new Story(inkJsonAsset.text);

        // Try to load saved game
        if (PlayerPrefs.HasKey(SAVE_KEY))
        {
            LoadGame();
        }
        else
        {
            // New game - display from start
            ContinueStory();
        }
    }

    void ContinueStory()
    {
        // Clear any existing choice buttons
        foreach (GameObject button in currentChoiceButtons)
        {
            Destroy(button);
        }
        currentChoiceButtons.Clear();

        // Read and display all available content
        while (story.canContinue)
        {
            string text = story.Continue().Trim();

            if (!string.IsNullOrEmpty(text))
            {
                AddStoryText(text, false);
            }
        }

        // Display choices if available
        if (story.currentChoices.Count > 0)
        {
            DisplayChoices();
        }
        else
        {
            // Story has ended
            AddStoryText("\n<i>(The End)</i>", false);
        }

        // Save game state after each continuation
        if (!isLoadingGame)
        {
            SaveGame();
        }

        // Auto-scroll to bottom after content is added
        StartCoroutine(ScrollToBottom());
    }

    void AddStoryText(string text, bool isChoice = false)
    {
        GameObject textObject = Instantiate(storyTextPrefab, contentPanel.transform);
        TextMeshProUGUI textComponent = textObject.GetComponent<TextMeshProUGUI>();
        textComponent.text = text;

        // Add to history (only if not loading)
        if (!isLoadingGame)
        {
            storyHistory.Add(new StoryHistoryItem { text = text, isChoice = isChoice });
        }

        LayoutRebuilder.ForceRebuildLayoutImmediate(contentPanel.GetComponent<RectTransform>());
    }

    void DisplayChoices()
    {
        foreach (Choice choice in story.currentChoices)
        {
            GameObject button = Instantiate(choiceButtonPrefab, contentPanel.transform);

            TextMeshProUGUI buttonText = button.GetComponentInChildren<TextMeshProUGUI>();
            buttonText.text = choice.text;

            Button buttonComponent = button.GetComponent<Button>();
            int choiceIndex = choice.index;
            buttonComponent.onClick.AddListener(() => OnChoiceSelected(choiceIndex));

            currentChoiceButtons.Add(button);
        }

        LayoutRebuilder.ForceRebuildLayoutImmediate(contentPanel.GetComponent<RectTransform>());
    }

    void OnChoiceSelected(int choiceIndex)
    {
        string chosenText = story.currentChoices[choiceIndex].text;

        foreach (GameObject button in currentChoiceButtons)
        {
            Destroy(button);
        }
        currentChoiceButtons.Clear();

        AddStoryText($"<color=#FFD700>→ {chosenText}</color>", true);

        story.ChooseChoiceIndex(choiceIndex);

        ContinueStory();
    }

    void SaveGame()
    {
        GameSaveData saveData = new GameSaveData
        {
            inkState = story.state.ToJson(),
            history = storyHistory
        };

        string saveJson = JsonUtility.ToJson(saveData);
        PlayerPrefs.SetString(SAVE_KEY, saveJson);
        PlayerPrefs.Save();
    }

    void LoadGame()
    {
        isLoadingGame = true;

        string saveJson = PlayerPrefs.GetString(SAVE_KEY);
        GameSaveData saveData = JsonUtility.FromJson<GameSaveData>(saveJson);

        // Restore Ink state
        story.state.LoadJson(saveData.inkState);

        // Clear existing content
        foreach (Transform child in contentPanel.transform)
        {
            Destroy(child.gameObject);
        }

        // Restore history
        storyHistory = saveData.history;
        foreach (StoryHistoryItem item in storyHistory)
        {
            GameObject textObject = Instantiate(storyTextPrefab, contentPanel.transform);
            TextMeshProUGUI textComponent = textObject.GetComponent<TextMeshProUGUI>();
            textComponent.text = item.text;
        }

        LayoutRebuilder.ForceRebuildLayoutImmediate(contentPanel.GetComponent<RectTransform>());

        isLoadingGame = false;

        // Display current choices
        ContinueStory();
    }

    void OnMenuButtonClicked()
    {
        // Save before returning to menu
        SaveGame();

        // Load main menu
        SceneManager.LoadScene("MainMenu");
    }

    IEnumerator ScrollToBottom()
    {
        yield return new WaitForEndOfFrame();

        float elapsedTime = 0f;
        float startValue = scrollRect.verticalNormalizedPosition;

        while (elapsedTime < autoScrollSpeed)
        {
            elapsedTime += Time.deltaTime;
            scrollRect.verticalNormalizedPosition = Mathf.Lerp(startValue, 0f, elapsedTime / autoScrollSpeed);
            yield return null;
        }

        scrollRect.verticalNormalizedPosition = 0f;
    }
}