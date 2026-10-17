import java.io.File

pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    // Polisi ditukar ke PREFER_SETTINGS untuk elak crash
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven("https://jitpack.io")
    }
}

rootProject.name = "CloudControlPlaneExtensions"

rootDir.listFiles()?.forEach { pluginFolder ->
    if (pluginFolder.isDirectory && !pluginFolder.name.startsWith(".")) {
        if (File(pluginFolder, "build.gradle.kts").exists()) {
            include(":${pluginFolder.name}")
        }
    }
}
