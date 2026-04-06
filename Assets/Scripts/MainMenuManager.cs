using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;

public class MainMenuManager : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private Button newGameButton;
    [SerializeField] private Button continueButton;
    [SerializeField] private Button quitButton;

    private const string SAVE_KEY = "InkGameSave";

    void Start()
    {
        // Wire up button listeners
        newGameButton.onClick.AddListener(OnNewGame);
        continueButton.onClick.AddListener(OnContinue);

        if (quitButton != null)
        {
            quitButton.onClick.AddListener(OnQuit);
        }

        // Check if save exists and enable/disable Continue button
        bool hasSave = PlayerPrefs.HasKey(SAVE_KEY);
        continueButton.interactable = hasSave;

        // Optional: Make it visually obvious
        if (!hasSave)
        {
            // Dim the button text too
            TextMeshProUGUI buttonText = continueButton.GetComponentInChildren<TextMeshProUGUI>();
            if (buttonText != null)
            {
                Color dimmedColor = buttonText.color;
                dimmedColor.a = 0.5f; // Make it semi-transparent
                buttonText.color = dimmedColor;
            }
        }
    }

    void OnNewGame()
    {
        // Clear any existing save
        PlayerPrefs.DeleteKey(SAVE_KEY);
        PlayerPrefs.Save();

        // Load game scene
        SceneManager.LoadScene("GameScene");
    }

    void OnContinue()
    {
        // Only load if save exists (extra safety check)
        if (PlayerPrefs.HasKey(SAVE_KEY))
        {
            SceneManager.LoadScene("GameScene");
        }
    }

    void OnQuit()
    {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
        Application.Quit();
#endif
    }
}