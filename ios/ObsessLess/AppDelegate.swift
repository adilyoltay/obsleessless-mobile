import Expo
import React

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.window = UIWindow(frame: UIScreen.main.bounds)
    
    self.window.backgroundColor = UIColor.white
    self.window.makeKeyAndVisible()
    
    // Initialize Expo modules
    _ = super.application(application, didFinishLaunchingWithOptions: launchOptions)
    
    return true
  }
}
