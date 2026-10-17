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

// --- Skrip Dinamik: Mencari Semua Plugin/Channel ---
// Ini akan membuatkan Gradle auto-detect sebarang folder (macam Sooka, SFlix, AllMovieLand)
// yang mempunyai fail 'build.gradle.kts'.
import java.io.File

rootDir.listFiles()?.forEach { pluginFolder ->
    // Kita filter: Hanya ambil folder yang bukan dotfile (bukan .git, .github dsb)
    if (pluginFolder.isDirectory && !pluginFolder.name.startsWith(".")) {
        // Semak kalau dalam folder tu ada build.gradle.kts (maksudnya ia adalah plugin CloudStream yang sah)
        if (File(pluginFolder, "build.gradle.kts").exists()) {
            include(":${pluginFolder.name}")
        }
        
        // Ataupun, kalau kau letak semua plugin Phisher tu di dalam folder spesifik (contohnya folder "extensions"):
        // Jika struktur kau ada sub-folder:
        /* 
        if (pluginFolder.name == "extensions") {
            pluginFolder.listFiles()?.forEach { subFolder ->
                if (subFolder.isDirectory && File(subFolder, "build.gradle.kts").exists()) {
                     include(":extensions:${subFolder.name}")
                }
            }
        }
        */
    }
}
