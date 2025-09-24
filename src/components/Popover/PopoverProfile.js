import { Form } from "@unform/web";
import { LogOut, Save, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { logout } from "~/store/modules/auth/actions";
import { updateProfileRequest } from "~/store/modules/auth/actions";
import InputField from "../InputField";
import Separator from "../Separator";
import { getFileUrl } from "~/services/firebase";

// helper: cria objeto Image
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

// helper: recorta e gera blob/url
async function getCroppedImg(imageSrc, crop, zoom = 1) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { x, y, width, height } = crop;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Canvas is empty"));
      blob.name = "avatar.png";
      resolve({ blob, url: URL.createObjectURL(blob) });
    }, "image/png");
  });
}

const schema = Yup.object().shape({
  name: Yup.string().required("O nome é obrigatório"),
  email: Yup.string()
    .email("Insira um e-mail válido!")
    .required("O e-mail é obrigatório."),
  password: Yup.string(),
});

export default function PopoverProfile() {
  const inputRef = useRef();
  const { profile } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const formRef = useRef();
  const navigate = useNavigate();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [preview, setPreview] = useState(null);
  if (profile?.avatar) {
    getFileUrl(profile?.avatar?.key).then((url) => {
      setPreview(url);
    });
  }
  const [avatarFile, setAvatarFile] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSumbit = useCallback(
    async (data) => {
      setLoading(true);
      try {
        formRef.current.setErrors({});
        await schema.validate(data, { abortEarly: false });

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        if (data.password) formData.append("password", data.password);

        if (avatarFile) {
          formData.append("avatar", avatarFile, "avatar.png");
        }

        setLoading(false);
        dispatch(updateProfileRequest(formData));
      } catch (err) {
        setLoading(false);
        if (err instanceof Yup.ValidationError) {
          const validationErrors = {};
          err.inner.forEach((error) => {
            validationErrors[error.path] = error.message;
          });
          formRef.current.setErrors(validationErrors);
        }
      }
    },
    [dispatch, avatarFile]
  );

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const handleSaveAvatar = async () => {
    if (!avatarUrl || !croppedAreaPixels) return;
    try {
      const { url, blob } = await getCroppedImg(
        avatarUrl,
        croppedAreaPixels,
        zoom
      );

      setAvatarFile(blob);
      setPreview(url);
      setAvatarUrl(null);
    } catch (err) {
      toast("Falha ao recortar imagem", { type: "error" });
    }
  };

  function handleLogout() {
    try {
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

  return (
    <div className="w-80 absolute top-9 right-0 bg-secondary rounded-xl flex flex-col shadow-xl p-2 text-xs">
      <Form
        ref={formRef}
        onSubmit={handleSumbit}
        className="p-2 space-y-4"
        initialData={{
          name: profile?.name,
          email: profile?.email,
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            {preview ? (
              <img
                src={preview}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#ee5827] flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">
              My Profile
            </h3>
            <p className="text-xs text-muted-foreground">Manager your infos</p>
          </div>
        </div>
        {avatarUrl && (
          <div className="fixed bg-black/70 inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-96 shadow-xl space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                Edit your avatar
              </h3>
              <div className="relative w-full h-64 bg-gray-200 rounded overflow-hidden">
                <Cropper
                  image={avatarUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <input
                  type="range"
                  min={1}
                  max={7}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setAvatarUrl(null)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  className="px-3 py-1 bg-[#ee5827] text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        <Separator />
        <div className="space-y-4">
          <InputField
            required={true}
            label={"Name"}
            name="name"
            id="name"
            placeholder={"Name"}
          />
          <InputField
            label={"Email"}
            required={true}
            name={"email"}
            id="email"
            type="email"
            placeholder="your@email.com"
          />
          <InputField
            label={"Password"}
            name={"password"}
            id="password"
            type="password"
            placeholder="Leave blank to keep the current password"
          />
        </div>
        <Separator />
        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center w-full h-10 font-medium rounded-md transition-colors ${
              loading
                ? "bg-[#d34414]/50 cursor-not-allowed"
                : "bg-[#ee5827] hover:bg-[#d34414]"
            }`}
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>
            ) : (
              <Save size={16} className="mr-2 text-white" />
            )}
            <h3 className="font-semibold text-white">
              {loading ? "Saving..." : "Save"}
            </h3>
          </button>
          <button
            onClick={handleLogout}
            type="button"
            disabled={loading}
            className={`flex items-center justify-center w-full h-10 font-medium border rounded-md transition-colors ${
              loading
                ? "border-red-500/50 cursor-not-allowed"
                : "border-red-500 hover:bg-red-500/20"
            }`}
          >
            <LogOut size={16} className="mr-2 text-red-500" />
            <h3
              className={`font-semibold ${
                loading ? "text-red-500/50" : "text-red-500"
              }`}
            >
              Logout
            </h3>
          </button>
        </div>
      </Form>
    </div>
  );
}
