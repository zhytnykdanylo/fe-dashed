import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button as BButton
} from "reactstrap";

import { useLocation } from "react-router-dom";

import logo from "../../assets/images/logo-solana.png";

import IconText from "../../assets/images/story-board/icon-text.png";
import IconChart from "../../assets/images/story-board/icon-chart.png";
import IconShape from "../../assets/images/story-board/icon-shape.png";
import IconButton from "../../assets/images/story-board/icon-button.png";
import IconPicture from "../../assets/images/story-board/icon-picture.png";
import IconTooltip from "../../assets/images/story-board/icon-tooltip.png";

import SolanaGradient from "../../assets/images/story-board/solana-gradient.png";
import {
  Text,
  Shape,
  Button,
  Image,
  Chart,
  Tooltip,
} from "../../components/StoryBoard";

import {
  IconAdd,
  IconLayers,
  IconCenter,
  IconLeft,
  IconRight,
  IconSettings,
  IconLoader
} from "../../components/Common/Icon";
import { Rnd } from "react-rnd";
import shortid from "shortid";
import { SketchPicker } from "react-color";
import DatePicker from "components/Common/DatePicker";
import StoryBoardModal, {
  TickerModal,
} from "../../components/StoryBoard/StoryBoardModal";
import { useDropzone } from 'react-dropzone'
import { supabase } from "supabaseClient";
import { useHistory } from "react-router-dom";
import { getStory, setPreview, saveStory, getFiles, uploadFiles, setPublish, saveThumbnail, updateStory } from "../../store/editor/actions"
import { openModal } from "../../store/modals/actions"
import { useDispatch, useSelector } from "react-redux"
import PublishTitle from "./PublishTitle";
import { getCoins } from "../../components/StoryBoard/charts/LineChart"
import { IconClose } from "components/Common/Icon";
import ConfirmRemoveImage from "./ConfirmRemoveImage";

const useQuery = () => {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
};

const StoryBoardPage = () => {
  const [isActiveMenu, setIsActiveMenu] = useState(false);
  const [canvas, setCanvas] = useState([]);
  const [story, setStory] = useState({ w: 1100, h: 600 });
  const [selected, setSelected] = useState({});
  const lastSelected = useRef({});
  const [index, setIndex] = useState(0);
  const [showChartOptions, setShowChartOptions] = useState(false);
  const [showTickerModal, setShowTickerModal] = useState(false);
  const [openTooltipPosition, setOpenTooltipPosition] = useState(false);
  const isSidebar = useRef(false);
  const [canvasClick, setCanvasClick] = useState(0);
  const [openTickerSelect, setOpenTickerSelect] = useState(false);
  const location = useLocation();
  const [lastAdded, setLastAdded] = useState(null)
  const [disableDrag, setDisableDrag] = useState(null)
  const [storyTitle, setStoryTitle] = useState("")
  const [storyDescription, setStoryDescription] = useState("")
  const [scale, setScale] = useState(1)
  const history = useHistory()
  const dispatch = useDispatch()
  const loadedCanvas = useSelector(state => state.Editor.canvas)
  const isPreview = useSelector(state => state.Editor.isPreview)
  const notification = useSelector(state => state.Editor.notification)
  const isLoading = useSelector(state => state.Editor.isLoading)
  const isSaving = useSelector(state => state.Editor.isSaving)
  const isFilesUploading = useSelector(state => state.Editor.isFilesUploading)
  const isPublish = useSelector(state => state.Editor.isPublish)
  const files = useSelector(state => state.Editor.files)
  const [user, setUser] = useState(supabase.auth.user())
  const [coins, setCoins] = useState([])
  const canvRef = useRef()
  const newStoryTitle = useSelector(state => state.Editor.newStoryTitle)
  const newStoryDescription = useSelector(state => state.Editor.newStoryDescription)

  const onDrop = useCallback(acceptedFiles => {
    dispatch(uploadFiles(acceptedFiles))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    acceptedFiles: ".jpg,.jpeg,.png,.svg"
  })

  let query = useQuery();
  const id = query.get("id");
  const isNew = query.get("new");

  useEffect(() => {
    if (id) dispatch(getStory(id, false, false))
  }, [id])

  useEffect(() => {
    if (isNew && (newStoryTitle && newStoryDescription)) dispatch(getStory(null, false, true, newStoryTitle, newStoryDescription))
  }, [isNew])

  useEffect(() => {
    if (loadedCanvas?.canvas) {
      setCanvas(loadedCanvas.canvas.canvas)
      setStory({ w: loadedCanvas.canvas.w, h: loadedCanvas.canvas.h })
      setStoryTitle(loadedCanvas.title)
      setStoryDescription(loadedCanvas.description)
    }
  }, [loadedCanvas])

  useEffect(() => {
    if (!user?.id) {
      dispatch(setPreview(true))
      history.push(`/story-preview`)
    }
  }, [user])

  useEffect(() => {
    if (isFilesUploading == false) dispatch(getFiles(`images/`))
  }, [isFilesUploading])

  useEffect(() => {
    if (canvas.length && user?.id && !isPreview) {
      dispatch(saveStory(canvas, story, loadedCanvas.id, canvRef))
    }
  }, [canvas, story]);

  useEffect(() => {

    document.addEventListener("keydown", onKeyPress, false);
    document.body.classList.remove("sidebar-enable");
    document.body.classList.add("remove-spaces");
    window.addEventListener("resize", onResize);
    window.dispatchEvent(new Event('resize'));

    getCoins().then((data) => {
      setCoins(data)
    })

    dispatch(getFiles(`images/`))

    const preview = query.get("preview");
    const publish = query.get("publish");

    dispatch(setPreview((preview || publish) ? true : false))
    dispatch(setPublish(publish ? true : false))

    return () => {
      document.removeEventListener("keydown", onKeyPress, false);
      document.body.classList.remove("vertical-collpsed");
      document.body.classList.remove("remove-spaces");
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    sScale()
  }, [story])

  const onResize = () => {
    sScale()
  }

  const sScale = () => {
    const publish = query.get("publish");

    if (publish && (window.innerWidth - story.w < 0)) {
      setTimeout(() => {
        setScale(window.innerWidth / story.w - 0.10)
      }, 1000)
    }
  }

  useEffect(() => {
    const preview = query.get("preview");
    const publish = query.get("publish");

    dispatch(setPreview((preview || publish) ? true : false))
    dispatch(setPublish(publish ? true : false))

  }, [location])

  const onRemoveComponent = (id) => {
    setCanvas(c => c.filter(item => item.id != id));
  }

  const onKeyPress = e => {
    if (!isSidebar.current) {
      if (e.key === "Delete") {
        setCanvas(c => c.filter(item => item.id != lastSelected.current.id));
      }

      if (e.key === "Escape") {
        setShowChartOptions(false);
        setShowTickerModal(false);
      }

      if (e.key === "+") {
        setCanvas(c => {
          return c.map((itm, i) => {
            return itm.id == lastSelected.current.id
              ? { ...itm, index: itm.index + 1 }
              : { ...itm };
          });
        });
      }

      if (e.key === "-") {
        setCanvas(c => {
          return c.map((itm, i) => {
            return itm.id == lastSelected.current.id
              ? { ...itm, index: itm.index > 1 ? itm.index - 1 : itm.index }
              : { ...itm };
          });
        });
      }
    }
  };

  const getProps = () =>
    canvas?.filter(item => item.id == selected.id)[0]?.props;

  const saveProp = (prop, value) => {
    setCanvas(c =>
      c.map(item =>
        item.id == selected.id
          ? { ...item, props: { ...item.props, [prop]: value } }
          : { ...item }
      )
    );
  };

  const onSaveStory = () => {
    dispatch(updateStory(loadedCanvas.id, storyTitle, storyDescription))
    setSelected({})
  }

  const onGenerateThumbnail = () => {
    dispatch(saveThumbnail(loadedCanvas.id, canvRef))
  }

  const onUpdateThumbnail = (url) => {
    dispatch(saveThumbnail(loadedCanvas.id, canvRef, url))
  }

  const renderMenu = () => {
    switch (selected.type) {
      case "shape":
        return (
          <div>
            <h3>Color</h3>
            <div className="sketch-picker-container">
              <SketchPicker
                color={getProps()?.background}
                onChange={e => {
                  saveProp("background", e.hex);
                }}
              />
            </div>
            <h3>Image</h3>
            <div className="story-board-images-container">
              <div className="story-board-images">
                <div
                  onClick={() => saveProp("img", "")}
                  className={`story-board-image empty ${!getProps()?.img ? "active" : ""
                    }`}
                >
                  Empty
                </div>
                <div
                  onClick={() => saveProp("img", SolanaGradient)}
                  className={`story-board-image ${getProps()?.img == SolanaGradient ? "active" : ""
                    }`}
                >
                  <img src={SolanaGradient} alt="" />
                </div>
                {files?.map((image, i) => (
                  image.name != '.emptyFolderPlaceholder' &&
                  <div
                    key={`img-${i}`}
                    className={`story-board-image ${getProps()?.img == image.url ? "active" : ""
                      }`}
                  >
                    <div
                      onClick={() => {
                        dispatch(openModal('confirmRemoveImage', image.name))
                      }}
                      className="story-component-remove"
                    >
                      <IconClose />
                    </div>
                    <img onClick={() => saveProp("img", image.url)} src={image.url} alt="" />
                  </div>
                ))}
              </div>
              <div className="mt-1 ps-2 pe-2">
                <div className={`drag-and-drop-files ${isDragActive ? 'active' : ''}`} {...getRootProps()}>
                  <input {...getInputProps()} />
                  {
                    isDragActive ?
                      <span>Drop the files here ...</span> :
                      <span>Drag some files here, or click to select files</span>
                  }
                </div>
              </div>
            </div>
            <h3>Background URL</h3>
            <input
              onChange={e => {
                saveProp("src", e.target.value);
              }}
              className="story-board-sidebar-input w-100"
              value={getProps()?.src}
              type="text"
            />
            <h3>Border radius</h3>
            <div className="story-board-sidebar-flex-row">
              <div>
                <input
                  onChange={e => {
                    saveProp("borderTopLeftRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderTopLeftRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderTopRightRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderTopRightRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderBottomLeftRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderBottomLeftRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderBottomRightRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderBottomRightRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
            </div>
          </div>
        );
      case "text":
        return (
          <div>
            <h3>Font Size</h3>
            <input
              onChange={e => {
                saveProp("fontSize", e.target.value);
              }}
              className="story-board-sidebar-input w-100"
              value={getProps()?.fontSize}
              type="number"
            />
            <Container fluid className="p-0">
              <Row>
                <Col md={5}>
                  <h3>Text Style</h3>
                  <div className="story-board-font-style">
                    <div
                      onClick={() =>
                        saveProp(
                          "fontWeight",
                          getProps()?.fontWeight ? "" : "bold"
                        )
                      }
                      className={`story-board-font-style-bold ${getProps()?.fontWeight ? "active" : ""
                        }`}
                    >
                      B
                    </div>
                    <div
                      onClick={() =>
                        saveProp(
                          "fontStyle",
                          getProps()?.fontStyle ? "" : "italic"
                        )
                      }
                      className={`story-board-font-style-bold ${getProps()?.fontStyle ? "active" : ""
                        }`}
                    >
                      i
                    </div>
                  </div>
                </Col>
                <Col md={7}>
                  <h3>Text Align</h3>
                  <div className="story-board-font-style">
                    <div
                      className={`${getProps()?.textAlign == "left" ? "active" : ""
                        }`}
                      onClick={() => saveProp("textAlign", "left")}
                    >
                      <IconLeft />
                    </div>
                    <div
                      className={`${getProps()?.textAlign == "center" ? "active" : ""
                        }`}
                      onClick={() => saveProp("textAlign", "center")}
                    >
                      <IconCenter />
                    </div>
                    <div
                      className={`${getProps()?.textAlign == "right" ? "active" : ""
                        }`}
                      onClick={() => saveProp("textAlign", "right")}
                    >
                      <IconRight />
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
            <h3>Color</h3>
            <div className="sketch-picker-container">
              <SketchPicker
                color={getProps()?.color}
                onChange={e => {
                  saveProp("color", e.hex);
                }}
              />
            </div>
            <h3>Count up</h3>
            <div className="story-board-font-style">
              <div
                onClick={() =>
                  saveProp("countUp", getProps()?.countUp ? false : true)
                }
                className={`story-board-font-style-bold ${getProps()?.countUp ? "active" : ""
                  }`}
              >
                +
              </div>
            </div>
          </div>
        );
      case "tooltip":
        return (
          <div>
            <h3>Position</h3>
            <Dropdown
              isOpen={openTooltipPosition}
              toggle={() => setOpenTooltipPosition(!openTooltipPosition)}
            >
              <DropdownToggle caret>{getProps()?.position}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => saveProp("position", "top")}>
                  top
                </DropdownItem>
                <DropdownItem onClick={() => saveProp("position", "bottom")}>
                  bottom
                </DropdownItem>
                <DropdownItem onClick={() => saveProp("position", "left")}>
                  left
                </DropdownItem>
                <DropdownItem onClick={() => saveProp("position", "right")}>
                  right
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <h3>Opacity</h3>
            <input
              min={0}
              max={100}
              step={10}
              type="range"
              className="form-range"
              id="opacityRange"
              value={getProps()?.opacity}
              onChange={e => {
                saveProp("opacity", e.target.value);
              }}
            />
            <h3>Color</h3>
            <div className="sketch-picker-container">
              <SketchPicker
                color={getProps()?.color}
                onChange={e => {
                  saveProp("color", e.hex);
                }}
              />
            </div>
          </div>
        );
      case "button":
        return (
          <div>
            <h3>Label</h3>
            <input
              onChange={e => {
                saveProp("label", e.target.value);
              }}
              className="story-board-sidebar-input w-100"
              value={getProps()?.label}
              type="text"
            />
            <h3>Font Size</h3>
            <input
              onChange={e => {
                saveProp("fontSize", e.target.value);
              }}
              className="story-board-sidebar-input w-100"
              value={getProps()?.fontSize}
              type="number"
            />
            <h3>Text Style</h3>
            <div className="story-board-font-style">
              <div
                onClick={() =>
                  saveProp("fontWeight", getProps()?.fontWeight ? "" : "bold")
                }
                className={`story-board-font-style-bold ${getProps()?.fontWeight ? "active" : ""
                  }`}
              >
                B
              </div>
              <div
                onClick={() =>
                  saveProp("fontStyle", getProps()?.fontStyle ? "" : "italic")
                }
                className={`story-board-font-style-bold ${getProps()?.fontStyle ? "active" : ""
                  }`}
              >
                i
              </div>
            </div>
            <h3>Background color</h3>
            <div className="sketch-picker-container">
              <SketchPicker
                color={getProps()?.background}
                onChange={e => {
                  saveProp("background", e.hex);
                }}
              />
            </div>
            <h3>Color</h3>
            <div className="sketch-picker-container">
              <SketchPicker
                color={getProps()?.color}
                onChange={e => {
                  saveProp("color", e.hex);
                }}
              />
            </div>
            <h3>Border radius</h3>
            <div className="story-board-sidebar-flex-row">
              <div>
                <input
                  onChange={e => {
                    saveProp("borderTopLeftRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderTopLeftRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderTopRightRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderTopRightRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderBottomLeftRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderBottomLeftRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderBottomRightRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderBottomRightRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
            </div>
            <h3>Link</h3>
            <input
              onChange={e => {
                saveProp("link", e.target.value);
              }}
              className="story-board-sidebar-input w-100"
              value={getProps()?.link}
              type="text"
            />
          </div>
        );
      case "image":
        return (
          <>
            <h3>URL</h3>
            <input
              onChange={e => {
                saveProp("src", e.target.value);
              }}
              className="story-board-sidebar-input w-100"
              value={getProps()?.src}
              type="text"
            />
            <h3>Image</h3>
            <div className="story-board-images-container">
              <div className="story-board-images">
                <div
                  onClick={() => saveProp("img", "")}
                  className={`story-board-image empty ${!getProps()?.img ? "active" : ""
                    }`}
                >
                  Empty
                </div>
                <div
                  onClick={() => saveProp("img", SolanaGradient)}
                  className={`story-board-image ${getProps()?.img == SolanaGradient ? "active" : ""
                    }`}
                >
                  <img src={SolanaGradient} alt="" />
                </div>
                {files?.map((image, i) => (
                  image.name != '.emptyFolderPlaceholder' &&
                  <div
                    key={`img-${i}`}
                    className={`story-board-image ${getProps()?.img == image.url ? "active" : ""
                      }`}
                  >
                    <div
                      onClick={() => {
                        dispatch(openModal('confirmRemoveImage', image.name))
                      }}
                      className="story-component-remove"
                    >
                      <IconClose />
                    </div>
                    <img onClick={() => saveProp("img", image.url)} src={image.url} alt="" />
                  </div>
                ))}
              </div>
              <div className="mt-1 ps-2 pe-2">
                <div className={`drag-and-drop-files ${isDragActive ? 'active' : ''}`} {...getRootProps()}>
                  <input {...getInputProps()} />
                  {
                    isDragActive ?
                      <span>Drop the files here ...</span> :
                      <span>Drag some files here, or click to select files</span>
                  }
                </div>
              </div>
            </div>
            <h3>Border radius</h3>
            <div className="story-board-sidebar-flex-row">
              <div>
                <input
                  onChange={e => {
                    saveProp("borderTopLeftRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderTopLeftRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderTopRightRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderTopRightRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderBottomLeftRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderBottomLeftRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
              <div>
                <input
                  onChange={e => {
                    saveProp("borderBottomRightRadius", e.target.value);
                  }}
                  className="story-board-sidebar-input w-100"
                  value={getProps()?.borderBottomRightRadius}
                  min={0}
                  max={1000}
                  type="number"
                />
              </div>
            </div>
          </>
        );
      case "chart":
        return (
          <div>
            <h3>Ticker Symbol</h3>
            <Dropdown
              isOpen={openTickerSelect}
              toggle={() => setOpenTickerSelect(!openTickerSelect)}
            >
              <DropdownToggle caret>{getProps()?.ticker}</DropdownToggle>
              <DropdownMenu>
                {coins?.map((coin, i) => (
                  <DropdownItem key={`ssi-${i}`} onClick={() => saveProp("ticker", coin.id)}>
                    {coin.id}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <h3>Data Range</h3>
            <div className="mb-3">
              <DatePicker
                onChange={(e) => saveProp("startDate", e.target.value)}
                placeholder="YYYY-MM-DD"
                name="startDate"
                filter="date"
                value={getProps()?.startDate}
                label={'From'}
              />
            </div>
            <div>
              <DatePicker
                onChange={(e) => saveProp("endDate", e.target.value)}
                placeholder="YYYY-MM-DD"
                name="endDate"
                type="date-adv"
                filter="date"
                value={getProps()?.endDate}
                label={'To'}
              />
            </div>
            <h3>Line Color 1</h3>
            <div className="sketch-picker-container">
              <SketchPicker
                color={getProps()?.color1}
                onChange={e => {
                  saveProp("color1", e.hex);
                }}
              />
            </div>
            <h3>Line Color 2</h3>
            <div className="sketch-picker-container">
              <SketchPicker
                color={getProps()?.color2}
                onChange={e => {
                  saveProp("color2", e.hex);
                }}
              />
            </div>

          </div>
        );
      case "Story settings":
        return (
          <div>
            <h3>Title</h3>
            <input
              onChange={e => {
                setStoryTitle(e.target.value)
              }}
              className="story-board-sidebar-input w-100"
              defaultValue={loadedCanvas.title}
            />
            <h3>Description</h3>
            <textarea
              onChange={e => {
                setStoryDescription(e.target.value)
              }}
              className="story-board-sidebar-textarea w-100"
              defaultValue={loadedCanvas.description}
            />
            <h3>Thumbnail</h3>
            {(loadedCanvas.thumbnail || loadedCanvas.customThumbnail) ?
              <div className="story-board-sidebar-thumbnail">
                <img src={loadedCanvas.customThumbnail ? loadedCanvas.customThumbnail : loadedCanvas.thumbnail} alt="" />
                {isSaving ?
                  <div className="story-board-sidebar-thumbloader">
                    <IconLoader />
                  </div>
                  :
                  <BButton
                    color="primary"
                    onClick={onGenerateThumbnail}
                    disabled={isSaving}
                    className="btn-rounded">
                    Regenerate thumbnail
                  </BButton>
                }

              </div>
              :
              <div>
                <BButton
                  color="primary"
                  onClick={onGenerateThumbnail}
                  disabled={isSaving}
                  className="btn-rounded w-100">
                  Generate thumbnail
                </BButton>
              </div>}
            <div className="story-board-images-container">
              <div className="story-board-images">
                <div
                  onClick={() => onUpdateThumbnail("clear")}
                  className={`story-board-image empty ${!getProps()?.img ? "active" : ""
                    }`}
                >
                  Empty
                </div>
                {files?.map((image, i) => (
                  image.name != '.emptyFolderPlaceholder' &&
                  <div
                    key={`img-${i}`}
                    className={`story-board-image`}
                  >
                    <div
                      onClick={() => {
                        dispatch(openModal('confirmRemoveImage', image.name))
                      }}
                      className="story-component-remove"
                    >
                      <IconClose />
                    </div>
                    <img onClick={() => onUpdateThumbnail(image.url)} src={image.url} alt="" />
                  </div>
                ))}
              </div>
              <div className="mt-1 ps-2 pe-2">
                <div className={`drag-and-drop-files ${isDragActive ? 'active' : ''}`} {...getRootProps()}>
                  <input {...getInputProps()} />
                  {
                    isDragActive ?
                      <span>Drop the files here ...</span> :
                      <span>Drag some files here, or click to select files</span>
                  }
                </div>
              </div>
            </div>
            <hr className="mt-4 mb-4" />
            <div className="d-flex">
              <BButton
                color="secondary"
                onClick={() => setSelected({})}
                className="btn-rounded w-100">
                Cancel
              </BButton>
              <BButton
                color="primary"
                onClick={onSaveStory}
                disabled={isSaving}
                className="btn-rounded ms-3 w-100">
                Save
              </BButton>
            </div>
          </div>
        );
      default:
        <></>;
    }
  };

  const getIndex = () => {
    setIndex(c => c + 1);
    return index + 1;
  };

  const removePx = (value) => {
    return String(value).replace("px", '')
  }

  const onAddText = () => {
    setCanvas(c => [
      ...c,
      {
        type: "text",
        id: shortid.generate(),
        index: getIndex(),
        x: removePx(story.w) / 2 - 65,
        y: removePx(story.h) / 2 - 30,
        w: 130,
        component: "Text",
        minWidth: 10,
        minHeight: 10,
        props: {
          color: "#ffffff",
          fontSize: 32,
          textAlign: "left",
          value: "",
        },
      },
    ]);
  };

  const onAddShape = () => {
    setCanvas(c => [
      ...c,
      {
        type: "shape",
        id: shortid.generate(),
        index: getIndex(),
        x: removePx(story.w) / 2 - 150,
        y: removePx(story.h) / 2 - 100,
        w: 300,
        h: 200,
        component: "Shape",
        minWidth: 1,
        minHeight: 1,
        props: {
          background: "#1D202D",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          src: "",
        },
      },
    ]);
  };

  const onAddButton = () => {
    setCanvas(c => [
      ...c,
      {
        type: "button",
        id: shortid.generate(),
        index: getIndex(),
        x: removePx(story.w) / 2 - 60,
        y: removePx(story.h) / 2 - 40,
        w: 120,
        h: 80,
        component: "Button",
        minWidth: 60,
        minHeight: 30,
        props: {
          background: "#4d74ff",
          color: "#ffffff",
          label: "Button",
          link: "www.google.com",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          fontSize: 16,
          height: 56,
        },
      },
    ]);
  };

  const onAddImage = () => {
    setCanvas(c => [
      ...c,
      {
        type: "image",
        id: shortid.generate(),
        index: getIndex(),
        x: removePx(story.w) / 2 - 150,
        y: removePx(story.h) / 2 - 50,
        width: 300,
        height: 300,
        component: "Image",
        minWidth: 60,
        minHeight: 80,
        props: {
          src: logo,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
      },
    ]);
  };

  const onAddChart = (ticker) => {
    setCanvas(c => [
      ...c,
      {
        type: "chart",
        id: shortid.generate(),
        index: getIndex(),
        x: removePx(story.w) / 2 - 300,
        y: removePx(story.h) / 2 - 185,
        w: 600,
        h: 370,
        component: "Chart",
        minWidth: 300,
        minHeight: 200,
        props: {
          startDate: "2020-01-01",
          endDate: "2021-12-31",
          ticker: ticker,
          color1: "#36F097",
          color2: "rgba(54, 240, 151, 0.2)"
        }
      },
    ]);
  };

  const onAddTooltip = () => {
    const id = shortid.generate()
    setLastAdded(id)

    setCanvas(c => [
      ...c,
      {
        type: "tooltip",
        id: id,
        index: getIndex(),
        x: removePx(story.w) / 2 - 14,
        y: removePx(story.h) / 2 - 14,
        w: 28,
        h: 28,
        component: "Tooltip",
        minWidth: 28,
        minHeight: 28,
        disableResize: true,
        props: {
          value: "",
          position: "top",
          color: "#1FF0A7",
          opacity: 90,
        },
      },
    ]);
  };

  const renderComponent = (ComponentName, item) => {
    switch (ComponentName) {
      case "Text":
        return (
          <Text
            {...item.props}
            isPreview={isPreview}
            onChange={e => onTextChange(e, item.id)}
            onFocus={() => {
              isSidebar.current = true
              setDisableDrag(item.id)
            }}
            onBlur={() => {
              isSidebar.current = false
              setDisableDrag(null)
            }}
          />
        );
      case "Shape":
        return <Shape {...item.props} />;
      case "Button":
        return <Button {...item.props} isPreview={isPreview} />;
      case "Tooltip":
        return (
          <Tooltip
            {...item.props}
            isLastAdded={lastAdded == item.id}
            canvasClick={canvasClick}
            onMouseLeave={() => (isSidebar.current = false)}
            onMouseEnter={() => (isSidebar.current = true)}
            onMouseEnterContent={() => setDisableDrag(item.id)}
            onMouseLeaveContent={() => setDisableDrag(false)}
            onChange={e => onTooltipChange(e, item.id)}
            isPreview={isPreview}
          />
        );
      case "Image":
        return <Image {...item.props} />;
      case "Chart":
        return <Chart {...item.props} onRemove={() => onRemoveComponent(item.id)} isPreview={isPreview} />;
    }
  };

  const handleChartTypeSelection = type => {
    /**
      @Todo onAddChart should pass along chart type in order to properly render different chart types
      example onAddChart(type) type = typeof 'Area' | 'Price' | 'Pie' | 'Line'| 'Scatter'
      */

    setShowChartOptions(false)
    setShowTickerModal(true)
  };

  const onTickerSelected = async ticker => {
    setCanvas(c => c.filter(item => item.type != "chart"));
    onAddChart(ticker)
    setShowTickerModal(false)
  };

  const onTextChange = (e, id) => {
    setCanvas(c =>
      c.map(item =>
        item.id == id
          ? { ...item, props: { ...item.props, value: e.target.value } }
          : { ...item }
      )
    );
  };

  const onDragStop = (e, d, id) => {
    setCanvas(c =>
      c.map(item => (item.id == id ? { ...item, x: d.x, y: d.y } : { ...item }))
    );
  };

  const onResizeStop = (ref, position, id) => {
    setCanvas(c =>
      c.map(item =>
        item.id == id
          ? {
            ...item,
            w: ref.style.width,
            h: ref.style.height,
            x: position.x,
            y: position.y,
          }
          : { ...item }
      )
    );
  };

  const onTooltipChange = (e, id) => {
    setCanvas(c =>
      c.map(item =>
        item.id == id
          ? { ...item, props: { ...item.props, value: e } }
          : { ...item }
      )
    );
  };

  const onResizeStoryStop = ref => {
    setStory({ w: ref.style.width, h: ref.style.height });
  };

  return (
    <div className={`page-content story-page ${isPublish ? 'publish' : ''}`}>
      {isPublish &&
        <PublishTitle
          onClickEdit={() => history.push(`/story-board?id=${loadedCanvas.id}`)}
          onClickUnpublish={() => dispatch(openModal('confirmPublish'))}
          asAdmin={loadedCanvas.userid == user.id}
          isPublished={loadedCanvas.published}
          data={loadedCanvas}
        />
      }
      <Container className={`story ${isPublish ? 'publish' : ''}`} fluid={true}>
        <div
          onMouseEnter={() => (isSidebar.current = true)}
          onMouseLeave={() => (isSidebar.current = false)}
          className={`${selected.type ? "active" : ""} story-board-sidebar`}
        >
          <div className="story-board-sidebar-title">
            {selected.type}
            <div onClick={() => setSelected({})}>
              <IconAdd />
            </div>
          </div>
          <div className="story-board-sidebar-inner">{renderMenu()}</div>
        </div>

        <div className="story-board">
          <div className="story-canvas" style={{ height: `calc(${String(story.h).replace("px", '')}px + ${isPublish ? '240px' : '140px'})`, transform: `scale(${scale})` }}>
            {(user.id == loadedCanvas.userid && !isPublish) &&
              <div className="story-board-right-actions">
                <div onClick={() => setSelected({ type: 'Story settings' })}>
                  <IconSettings />
                </div>
              </div>
            }
            <StoryBoardModal
              onSelectChart={handleChartTypeSelection}
              isOpen={showChartOptions}
              toggle={() => setShowChartOptions(!showChartOptions)}
            />
            <TickerModal
              isOpen={showTickerModal}
              onClose={() => setShowTickerModal(false)}
              onChange={onTickerSelected}
              toggle={() => setShowTickerModal(!showTickerModal)}
            />
            {notification ? (
              <div className="story-board-notification">{notification}</div>
            ) : (
              <Rnd
                position={{
                  x: "50%",
                  y: 0,
                }}
                size={{ width: story.w + 20, height: story.h + 20 }}
                className={`story-canvas-editor ${isPreview ? "preview" : ""}`}
                maxWidth={2000}
                minWidth={100}
                minHeight={100}
                onClick={(e) => {
                  setCanvasClick(e.target)
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  if (!isPreview) onResizeStoryStop(ref, position);
                }}
                enableResizing={!isPreview}
                disableDragging
              >
                <div ref={canvRef} className="story-canvas-inner">
                  {canvas?.map((item, i) => (
                    <Rnd
                      key={`rg-${i}`}
                      style={{ zIndex: item.index }}
                      size={{ width: item.w, height: item.h }}
                      position={{ x: item.x, y: item.y }}
                      onDragStop={(e, d) => {
                        if (!isPreview) onDragStop(e, d, item.id);
                      }}
                      onClick={() => {
                        if (!isPreview) {
                          lastSelected.current = item;
                          setSelected(item);
                        }
                      }}
                      onResizeStop={(e, direction, ref, delta, position) => {
                        if (!isPreview) {
                          onResizeStop(ref, position, item.id);
                        }
                      }}
                      minWidth={item.minWidth}
                      minHeight={item.minHeight}
                      bounds="parent"
                      enableResizing={!item.disableResize && !isPreview}
                      disableDragging={isPreview || (item.id == disableDrag)}
                    >
                      {renderComponent(item.component, item)}
                    </Rnd>
                  ))}
                </div>
              </Rnd>
            )}
          </div>
        </div>
        {(!isPreview && loadedCanvas?.canvas) &&
          <div className="story-canvas-actions">
            {/* {id && <div className="story-canvas-actions-id">id: {id}</div>} */}
            <div className="d-flex w-100 justify-content-between">
              <div className="story-canvas-actions-btn">
                <IconLayers />
              </div>
              <div
                onClick={() => setIsActiveMenu(!isActiveMenu)}
                className={`story-canvas-actions-btn ${isActiveMenu ? "active" : ""
                  }`}
              >
                <IconAdd />
              </div>
            </div>
            <div
              className={`story-canvas-actions-menu ${isActiveMenu ? "active" : ""
                }`}
              onClick={() => setIsActiveMenu(false)}
            >
              <div onClick={onAddText}>
                <img src={IconText} alt="Icon text" />
                <span>Text</span>
              </div>
              <div onClick={() => setShowChartOptions(!showChartOptions)}>
                <img src={IconChart} alt="Icon chart" />
                <span>Chart</span>
              </div>
              <div onClick={onAddShape}>
                <img src={IconShape} alt="Icon shape" />
                <span>Shape</span>
              </div>
              <div onClick={onAddButton}>
                <img src={IconButton} alt="Icon button" />
                <span>Button</span>
              </div>
              <div onClick={onAddImage}>
                <img
                  src={IconPicture}
                  className="story-canvas-actions-small"
                  alt="Icon picture"
                />
                <span>Picture</span>
              </div>
              <div onClick={onAddTooltip}>
                <img
                  src={IconTooltip}
                  className="story-canvas-actions-tiny"
                  alt="Icon tooltip"
                />
                <span>Tooltip</span>
              </div>
            </div>
          </div>
        }
      </Container>
      <ConfirmRemoveImage />
    </div>
  );
};

export default StoryBoardPage;
