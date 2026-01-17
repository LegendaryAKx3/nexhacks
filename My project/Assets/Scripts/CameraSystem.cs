using Unity.Cinemachine;
using UnityEngine;

public class CameraSystem : MonoBehaviour
{
    [SerializeField]
    private CinemachineCamera camera1;
    [SerializeField]
    private CinemachineCamera camera2;

    private float timer;
    private bool isCamera1Active = true;

    private void Start()
    {
        // Initialize camera priorities
        if (camera1 != null)
            camera1.Priority = 10;
        if (camera2 != null)
            camera2.Priority = 0;

        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    private void Update()
    {
        timer += Time.deltaTime;

        if (timer >= 5f)
        {
            timer = 0f;
            SwitchCameras();
        }
    }

    private void SwitchCameras()
    {
        isCamera1Active = !isCamera1Active;

        if (isCamera1Active)
        {
            if (camera1 != null)
                camera1.Priority = 10;
            if (camera2 != null)
                camera2.Priority = 0;
        }
        else
        {
            if (camera1 != null)
                camera1.Priority = 0;
            if (camera2 != null)
                camera2.Priority = 10;
        }
    }
}