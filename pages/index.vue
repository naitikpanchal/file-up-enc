<script lang="ts" setup>
import { ref } from "vue";

let file1 = ref<FileList | null>(null);
let file2 = ref<FileList | null>(null); // First file input
let file3 = ref<FileList | null>(null); // Second file input
let uploadedFilePaths = ref<string[] | null>(null);
let downloadedFilePaths = ref<string[] | null>(null);
let fileData = ref<string | null>(null); // Update type to string|null
let filePath: string = "";
let isFileImage = ref<boolean | null>(null);
const fileId = ref<string>(""); // Define fileId to store the entered file ID = true;
const imageExtensions = [".png", ".jpg", ".jpeg", ".gif"];
let btnVal = ref<boolean>(true);

function handleFileChange(e: Event, inputName: string) {
  // files.value = (e.target as HTMLInputElement).files;
  // console.log(files.value);  
  if (inputName === 'file1') {
    file1.value = (e.target as HTMLInputElement).files;
  } else if (inputName === 'file2') {
    file2.value = (e.target as HTMLInputElement).files;
  }
  else if (inputName === 'file3') {
    file3.value = (e.target as HTMLInputElement).files;
  }
}
async function handleFileSubmit() {
  const fd = new FormData();
  if (file1.value) {
    Array.from(file1.value).forEach((file, index) => {
      fd.append(`index${index}`, file);
    });
  }

  if (file2.value) {
    Array.from(file2.value).forEach((file, index) => {
      fd.append(`index${index}`, file);
    });
  }
  
  if (file3.value) {
    Array.from(file3.value).forEach((file, index) => {
      fd.append(`index${index}`, file);
    });
  }
  const data = await $fetch<string[]>("/api/file", {
    method: "POST",
    body: fd,
  });
  uploadedFilePaths.value = data;
}

async function clearPublicFolder() {
	btnVal.value = false;
  try {
    const response = await fetch("/api/clearFolder", {
      method: "POST", // or "GET" depending on your server route
    });
    if (response.ok) {
      console.log("Public folder cleared successfully");
    } else {
      console.error("Failed to clear public folder");
    }
  } catch (error) {
    console.error("Error clearing public folder:", error);
  }
}

function btnValChange() {
  btnVal.value = !btnVal.value;
  // isFileImage.value = null;
  console.log("btnVal: " + btnVal);
}

async function handleGetFile() {
	btnVal.value = false;
  try {
    const response = await fetch(`/api/file?fileId=${fileId.value}`, {
      method: "GET",
    });

    if (response.ok) {
      fileData = await response.json(); // Get the file path from the response
      filePath = fileData.body;
      console.log(filePath);
      console.log("FIlePATH from handleGetFIle:  " + filePath);
      const extension = filePath
        .toLowerCase()
        .substring(filePath.lastIndexOf("."));
      isFileImage.value = imageExtensions.includes(extension);
      btnVal.value = true;
      console.log("isFileImage: " + isFileImage);
    } else {
      console.error("Error from handleGetFile:", response.statusText);
      fileData.value = null;
    }
  } catch (error) {
    console.error("Error:", error);
    fileData.value = null;
  }
}
</script>

<template>
  <div class="mainDiv">
    <form @submit.prevent="handleFileSubmit" class="formClass">
      <label>Please select the files to upload.</label>
      <br />
      <input type="file" @change="handleFileChange($event, 'file1')" />
      <br />
      <input type="file" @change="handleFileChange($event, 'file2')" />
      <br />
      <input type="file"@change="handleFileChange($event, 'file3')" />
      <br />
      <button type="submit">Submit</button>
    </form>
    <div v-if="uploadedFilePaths">
      <div v-for="file in uploadedFilePaths" :key="file">
        File SHow here
        <img :src="file" />
      </div>
    </div>
    <form @submit.prevent="handleGetFile" class="formClass">
      <label for="fileId">Enter File ID:</label>
      <input type="text" id="fileId" v-model="fileId" />
      <button type="submit">Get File</button>
    </form>
    <button @click="clearPublicFolder">
      Clear Everything
    </button>
	<button @click="btnValChange">
      <template v-if="btnVal"> ON</template>
      <template v-else> Off</template>
    </button>

    <template v-if="btnVal">
      <div v-if="isFileImage !== null">
        <template v-if="isFileImage">
          <p>Its an image</p>
          <img :src="filePath" alt="REtrieved file" />
        </template>
        <template v-else>
          <p>Its not an image</p>
          <button>
            <a :href="filePath" target="_blank" download>Download File</a>
          </button>
          <!-- <div>
					<iframe :src="filePath" width="800px" height="100%"></iframe>
				</div> -->
        </template>
      </div>
    </template>
</div>
<template v-if="btnVal">
	<p>Content Hidden</p>
	<template v-if="isFileImage === false">
		<div class="contentDiv">
			<iframe :src="filePath" width="100%" height="800px"></iframe>
		</div>
	</template>
  </template>
</template>

<style scoped lang="css">
.mainDiv {
  background-color: lightgrey;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid grey;
  width: 50%;
  display: block;
  margin: auto;
}

.contentDiv {
  background-color: lightgrey;
  padding: 10px;
  border-radius: 8px;
  align-items: center;
  border: 2px solid grey;
  width: 100%;
  display: block;
  margin: auto;
}

.formClass {
  border: 2px dashed black;
  border-radius: 5px;
  padding: 8px;
}
label {
  font: bold;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 18px;
  padding: 8px;
}

input[type="file"] {
  margin: 10px auto;
  padding: 10px;
  display: block;
  font-family: sans-serif;
  font-size: 15px;
}

input[type="file"]::file-selector-button {
  padding: 10px 24px;
  background-color: white;
  color: black;
  font-family: sans-serif;
  font-size: 15px;
  border: 2px solid lightcoral;
  border-radius: 8px;
}

button {
  margin: auto;
  display: block;
  background-color: white;
  color: black;
  border-radius: 12px;
  padding: 12px 28px;
  font-size: 14px;
  border: 2px solid #008cba;
  transition-duration: 0.4s;
  font-family: Arial, Helvetica, sans-serif;
}

button:hover {
  background-color: #008cba;
  color: white;
}
</style>

<!-- // ------------------ NEW FUNCTION Working ----------------
// async function handleGetFile() {
//     try {
//         const response = await fetch(`/api/file?fileId=${fileId.value}`, {
//             method: 'GET',
//         });

//         if (response.ok) {
//             // const data = await response;
//             // console.log("Response::: ");
//             // console.log(response);
//             // fileData.value = await response;
//             const filePath = await response.text(); // Get the file path from the response
//             console.log("FIlePATH"+filePath);
//             fileData.value = filePath;
//         } else {
//             console.error('Error:', response.statusText);
//             fileData.value = null;
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         fileData.value = null;
//     }
// }

// ----------- OLD FUNCTION ----------------
// async function handleGetFile() {
//   try {
//     const response = await $fetch<string>('/api/getFile', {
//       method: 'POST',
//       body: JSON.stringify({ fileId: fileId.value }),
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     if (response) {
//       fileData.value = response;
//     } else {
//       fileData.value = null;
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     fileData.value = null;
//   }
// } -->
