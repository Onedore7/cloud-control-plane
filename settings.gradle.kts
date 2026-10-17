import java.io.File

pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
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
