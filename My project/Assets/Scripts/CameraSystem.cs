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

    }

    private void Update()
    {

    }

    private void SwitchCameras()
    {
        //isCamera1Active = !isCamera1Active;

        //if (isCamera1Active)
        //{
        //    if (camera1 != null)
        //        camera1.Priority = 10;
        //    if (camera2 != null)
        //        camera2.Priority = 0;
        //}
        //else
        //{
        //    if (camera1 != null)
        //        camera1.Priority = 0;
        //    if (camera2 != null)
        //        camera2.Priority = 10;
        //}
    }
}