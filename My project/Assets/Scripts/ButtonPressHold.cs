using UnityEngine;
using UnityEngine.InputSystem;

public class RaycastButtonPress : MonoBehaviour
{
    public Camera rayCamera;
    public Animator animator;

    public InputAction click;
    public InputAction mousePos;

    void Awake()
    {
        if (rayCamera == null)
            rayCamera = Camera.main;
    }

    void OnEnable()
    {
        click.performed += OnClick;
        click.Enable();
        mousePos.Enable();
    }

    void OnDisable()
    {
        click.performed -= OnClick;
        click.Disable();
        mousePos.Disable();
    }

    void OnClick(InputAction.CallbackContext ctx)
    {
        Vector2 screenPos = mousePos.ReadValue<Vector2>();
        Ray ray = rayCamera.ScreenPointToRay(screenPos);

        if (Physics.Raycast(ray, out RaycastHit hit))
        {
            if (hit.collider.gameObject == gameObject)
            {
                animator.Play("ButtonPress");
                Debug.Log("Button Clicked!");
            }
        }
    }
}
