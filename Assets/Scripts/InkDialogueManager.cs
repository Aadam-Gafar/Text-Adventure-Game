using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Ink.Runtime;
using System.Collections.Generic;

public class InkDialogueManager : MonoBehaviour
{
    [Header("Ink Story")]
    [SerializeField] private TextAsset inkJsonAsset;

    [Header("UI References")]
    [SerializeField] private TextMeshProUGUI storyText;
    [SerializeField] private GameObject choicesPanel;
    [SerializeField] private GameObject choiceButtonPrefab;

    private Story story;
    private List<GameObject> currentChoiceButtons = new List<GameObject>();

    void Start()
    {
        // Initialize the story
        story = new Story(inkJsonAsset.text);

        // Display the first line
        ContinueStory();
    }

    void ContinueStory()
    {
        // Clear previous choices
        foreach (GameObject button in currentChoiceButtons)
        {
            Destroy(button);
        }
        currentChoiceButtons.Clear();

        // Read all available content
        string currentText = "";
        while (story.canContinue)
        {
            currentText += story.Continue();
        }

        // Display the text
        storyText.text = currentText.Trim();

        // Display choices if available
        if (story.currentChoices.Count > 0)
        {
            DisplayChoices();
        }
        else
        {
            // Story has ended
            storyText.text += "\n\n<i>(The End)</i>";
        }
    }

    void DisplayChoices()
    {
        foreach (Choice choice in story.currentChoices)
        {
            // Create a button for each choice
            GameObject button = Instantiate(choiceButtonPrefab, choicesPanel.transform);

            // Set the button text
            TextMeshProUGUI buttonText = button.GetComponentInChildren<TextMeshProUGUI>();
            buttonText.text = choice.text;

            // Add listener to handle choice selection
            Button buttonComponent = button.GetComponent<Button>();
            int choiceIndex = choice.index; // Capture for closure
            buttonComponent.onClick.AddListener(() => OnChoiceSelected(choiceIndex));

            currentChoiceButtons.Add(button);
        }
    }

    void OnChoiceSelected(int choiceIndex)
    {
        // Tell the story which choice was selected
        story.ChooseChoiceIndex(choiceIndex);

        // Continue the story
        ContinueStory();
    }
}