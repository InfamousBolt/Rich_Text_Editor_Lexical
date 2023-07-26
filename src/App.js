import "./styles.css";
import Editor from "./Editor";
import ReadEditor from "./ReadEditor";
import ReadOnlyEditor from "./ReadOnlyEditor.tsx";
import Badge from "react-bootstrap/Badge";
import { HTML_TESTS } from "./utils/html_tests";
import { useState } from "react";


export default function App() {
  const [content, setContent] = useState("");
  const setContentText = (text) => {
    setContent(text);
  }
  return (
    <div className="App">
      <div className="container">
        <div className="row mt-4">
          <div className="col text-center">
            <h1>
              <Badge className="text-align-center" variant="light">
                Quill-Lexical Tester
              </Badge>
            </h1>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-md-6" style={{ border: '1px solid black' }}>
            <div className="col text-center">
              <h4>
                <Badge className="text-align-center" variant="secondary">
                  Quill Content
                </Badge>
              </h4>
            </div>
            <div className="editor-input quill-content">
              {HTML_TESTS.map((element) => <div


                dangerouslySetInnerHTML={{

                  __html: element || '-',

                }}

              />)}
            </div>
          </div>

          <div className="col-md-6" style={{ border: '1px solid black' }}>
            <div className="col text-center">
              <h4>
                <Badge className="text-align-center" variant="secondary">
                  Lexical Content
                </Badge>
              </h4>
            </div>
            <ReadOnlyEditor />
          </div>
        </div>
      </div>
    </div>
  )
}