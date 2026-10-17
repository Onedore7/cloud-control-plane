import java.io.File

pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven("https://jitpack.io")
    }
}

rootProject.name = "CloudControlPlaneExtensions"

// --- Enjin Deep-Search (Depth 1 & Depth 2) ---
rootDir.listFiles()?.forEach { dir ->
    if (dir.isDirectory && !dir.name.startsWith(".")) {
        // Semak Depth 1 (Level luar)
        if (File(dir, "build.gradle.kts").exists()) {
            include(":${dir.name}")
        } else {
            // Semak Depth 2 (Level dalam folder kategori macam /Anime, /English)
            dir.listFiles()?.forEach { subDir ->
                if (subDir.isDirectory && !subDir.name.startsWith(".")) {
                    if (File(subDir, "build.gradle.kts").exists()) {
                        include(":${dir.name}:${subDir.name}")
                    }
                }
            }
        }
    }
}
