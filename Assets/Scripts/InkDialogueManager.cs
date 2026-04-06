using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Ink.Runtime;
using System.Collections;
using System.Collections.Generic;

public class InkDialogueManager : MonoBehaviour
{
    [Header("Ink Story")]
    [SerializeField] private TextAsset inkJsonAsset;

    [Header("UI References")]
    [SerializeField] private GameObject contentPanel; // The Content object inside ScrollView
    [SerializeField] private ScrollRect scrollRect;
    [SerializeField] private GameObject storyTextPrefab;
    [SerializeField] private GameObject choiceButtonPrefab;

    [Header("Settings")]
    [SerializeField] private float autoScrollSpeed = 0.3f;

    private Story story;
    private List<GameObject> currentChoiceButtons = new List<GameObject>();

    void Start()
    {
        // Initialize the story
        story = new Story(inkJsonAsset.text);

        // Display the first content
        ContinueStory();
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
                AddStoryText(text);
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
            AddStoryText("\n<i>(The End)</i>");
        }

        // Auto-scroll to bottom after content is added
        StartCoroutine(ScrollToBottom());
    }

    void AddStoryText(string text)
    {
        // Instantiate a new text block
        GameObject textObject = Instantiate(storyTextPrefab, contentPanel.transform);
        TextMeshProUGUI textComponent = textObject.GetComponent<TextMeshProUGUI>();
        textComponent.text = text;

        // Force layout rebuild
        LayoutRebuilder.ForceRebuildLayoutImmediate(contentPanel.GetComponent<RectTransform>());
    }

    void DisplayChoices()
    {
        foreach (Choice choice in story.currentChoices)
        {
            // Create a button for each choice
            GameObject button = Instantiate(choiceButtonPrefab, contentPanel.transform);

            // Set the button text
            TextMeshProUGUI buttonText = button.GetComponentInChildren<TextMeshProUGUI>();
            buttonText.text = choice.text;

            // Add listener to handle choice selection
            Button buttonComponent = button.GetComponent<Button>();
            int choiceIndex = choice.index; // Capture for closure
            buttonComponent.onClick.AddListener(() => OnChoiceSelected(choiceIndex));

            currentChoiceButtons.Add(button);
        }

        // Force layout rebuild after adding choices
        LayoutRebuilder.ForceRebuildLayoutImmediate(contentPanel.GetComponent<RectTransform>());
    }

    void OnChoiceSelected(int choiceIndex)
    {
        // Show the selected choice as text (so player sees what they chose)
        string chosenText = story.currentChoices[choiceIndex].text;

        // Remove choice buttons
        foreach (GameObject button in currentChoiceButtons)
        {
            Destroy(button);
        }
        currentChoiceButtons.Clear();

        // Display the choice that was made
        AddStoryText($"<color=#FFD700>→ {chosenText}</color>");

        // Tell the story which choice was selected
        story.ChooseChoiceIndex(choiceIndex);

        // Continue the story
        ContinueStory();
    }

    IEnumerator ScrollToBottom()
    {
        // Wait for end of frame to ensure layout is updated
        yield return new WaitForEndOfFrame();

        // Smoothly scroll to bottom
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